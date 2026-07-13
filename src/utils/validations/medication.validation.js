export const validationMedication = {
    timestamp(value, fieldName = 'Horário') {
        const errors = [];

        if (!value) {
            errors.push(`${fieldName} é obrigatório`);
            return { isValid: false, errors, normalized: null };
        }

        if (
            typeof value === 'string' &&
            value.includes(':') &&
            !value.includes('T')
        ) {
            const timeValidation = this.time(value);
            errors.push(...timeValidation.errors);
        } else if (typeof value === 'string') {
            const isoRegex =
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

            if (!isoRegex.test(value)) {
                errors.push(
                    `Formato de ${fieldName.toLowerCase()} inválido. Use ISO format (YYYY-MM-DDTHH:mm:ss)`,
                );
            } else {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    errors.push(`${fieldName} inválido`);
                }
            }
        } else if (value instanceof Date) {
            if (isNaN(value.getTime())) {
                errors.push(`${fieldName} inválido`);
            }
        } else {
            errors.push(`${fieldName} deve ser uma data/hora válida`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            normalized: value,
        };
    },

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

        if (data.hourfirstdose) {
            const timeValidation = this.timestamp(
                data.hourfirstdose,
                'Horário da primeira dose',
            );
            errors.push(...timeValidation.errors);
        } else if (!isUpdate) {
            errors.push('Horário da primeira dose é obrigatório');
        }

        if (data.hournextdose) {
            const timeValidation = this.timestamp(
                data.hournextdose,
                'Próximo horário',
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

    validateCreate(data) {
        return this.medication(data, false);
    },

    validateUpdate(data) {
        return this.medication(data, true);
    },

    isFutureTimestamp(timestamp) {
        if (!timestamp)
            return { isValid: false, message: 'Timestamp é obrigatório' };

        const date =
            typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        const now = new Date();

        if (isNaN(date.getTime())) {
            return { isValid: false, message: 'Timestamp inválido' };
        }

        if (date < now) {
            return { isValid: false, message: 'Data/hora deve ser no futuro' };
        }

        return { isValid: true };
    },

    isWithinPeriod(timestamp, periodStart, periodEnd) {
        if (!timestamp)
            return { isValid: false, message: 'Timestamp é obrigatório' };

        const date =
            typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        const start = periodStart ? new Date(periodStart) : null;
        const end = periodEnd ? new Date(periodEnd) : null;

        if (isNaN(date.getTime())) {
            return { isValid: false, message: 'Timestamp inválido' };
        }

        if (start && date < start) {
            return {
                isValid: false,
                message: 'Data/hora anterior ao início do período',
            };
        }

        if (end && date > end) {
            return {
                isValid: false,
                message: 'Data/hora posterior ao fim do período',
            };
        }

        return { isValid: true };
    },
};
