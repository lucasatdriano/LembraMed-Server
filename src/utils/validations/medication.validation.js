export const validationMedication = {
    time(time) {
        const errors = [];

        if (!time) {
            errors.push('Horário é obrigatório');
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

        if (time && !timeRegex.test(time)) {
            errors.push('Formato de horário inválido. Use HH:MM (ex: 14:30)');
        }

        if (time && timeRegex.test(time)) {
            const [hours, minutes] = time.split(':').map(Number);

            if (hours < 0 || hours > 23) {
                errors.push('Horas devem estar entre 00 e 23');
            }

            if (minutes < 0 || minutes > 59) {
                errors.push('Minutos devem estar entre 00 e 59');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            normalized: time?.trim(),
        };
    },

    date(date, fieldName = 'Data') {
        const errors = [];

        if (!date) {
            errors.push(`${fieldName} é obrigatória`);
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (date && !dateRegex.test(date)) {
            errors.push(
                `Formato de ${fieldName.toLowerCase()} inválido. Use YYYY-MM-DD`,
            );
        }

        return {
            isValid: errors.length === 0,
            errors,
            normalized: date,
        };
    },

    interval(interval) {
        const errors = [];

        if (interval === undefined || interval === null) {
            errors.push('Intervalo entre doses é obrigatório');
        }

        if (interval !== undefined && interval !== null) {
            if (!Number.isInteger(interval)) {
                errors.push('Intervalo deve ser um número inteiro');
            }

            if (interval <= 0) {
                errors.push('Intervalo entre doses deve ser maior que zero');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            normalized: interval,
        };
    },

    name(name) {
        const errors = [];

        if (!name?.trim()) {
            errors.push('Nome do medicamento é obrigatório');
        }

        if (name && name.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        if (name && name.trim().length > 100) {
            errors.push('Nome deve ter no máximo 100 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors,
            normalized: name?.trim(),
        };
    },

    period(start, end) {
        const errors = [];

        const startValidation = this.date(start, 'Data de início');
        const endValidation = this.date(end, 'Data de fim');

        errors.push(...startValidation.errors);
        errors.push(...endValidation.errors);

        if (startValidation.isValid && endValidation.isValid) {
            const startDate = new Date(start);
            const endDate = new Date(end);

            if (endDate < startDate) {
                errors.push(
                    'Data de fim deve ser maior ou igual à data de início',
                );
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            normalized: {
                periodstart: start,
                periodend: end,
            },
        };
    },

    medication(data, isUpdate = false) {
        const errors = [];

        const nameValidation = this.name(data.name);
        errors.push(...nameValidation.errors);

        if (!isUpdate || data.hournextdose || data.hourfirstdose) {
            const timeValidation = this.time(
                data.hourfirstdose ?? data.hournextdose,
            );
            errors.push(...timeValidation.errors);
        }

        const intervalValidation = this.interval(data.intervalinhours);
        errors.push(...intervalValidation.errors);

        let periodNormalized = null;

        if (data.periodstart || data.periodend) {
            const periodValidation = this.period(
                data.periodstart,
                data.periodend,
            );

            errors.push(...periodValidation.errors);

            if (periodValidation.isValid) {
                periodNormalized = periodValidation.normalized;
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            normalized: {
                name: nameValidation.normalized,
                intervalinhours: intervalValidation.normalized,
                hourfirstdose: data.hourfirstdose,
                hournextdose: data.hournextdose,
                ...periodNormalized,
            },
        };
    },
};
