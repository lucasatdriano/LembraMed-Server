export const validationMedication = {
    /**
     * Valida formato de hora HH:MM
     * @param {string} time - Hora no formato HH:MM
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    time(time) {
        const errors = [];

        if (!time) {
            errors.push('Horário é obrigatório');
            return { isValid: false, errors };
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        if (!timeRegex.test(time)) {
            errors.push('Formato de horário inválido. Use HH:MM (ex: 14:30)');
            return { isValid: false, errors };
        }

        const [hours, minutes] = time.split(':').map(Number);
        if (minutes < 0 || minutes > 59) {
            errors.push('Minutos devem estar entre 00 e 59');
        }
        if (hours < 0 || hours > 23) {
            errors.push('Horas devem estar entre 00 e 23');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Valida formato de data YYYY-MM-DD
     * @param {string} date - Data no formato YYYY-MM-DD
     * @param {string} fieldName - Nome do campo para mensagem de erro
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    date(date, fieldName = 'Data') {
        const errors = [];

        if (!date) {
            errors.push(`${fieldName} é obrigatória`);
            return { isValid: false, errors };
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            errors.push(
                `Formato de ${fieldName.toLowerCase()} inválido. Use YYYY-MM-DD`,
            );
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Valida intervalo entre doses
     * @param {number} interval - Intervalo em horas
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    interval(interval) {
        const errors = [];

        if (!interval && interval !== 0) {
            errors.push('Intervalo entre doses é obrigatório');
        } else if (interval <= 0) {
            errors.push('Intervalo entre doses deve ser maior que zero');
        } else if (!Number.isInteger(interval)) {
            errors.push('Intervalo deve ser um número inteiro');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Valida nome do medicamento
     * @param {string} name - Nome do medicamento
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    name(name) {
        const errors = [];

        if (!name || name.trim().length === 0) {
            errors.push('Nome do medicamento é obrigatório');
        } else if (name.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        } else if (name.trim().length > 100) {
            errors.push('Nome deve ter no máximo 100 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Valida período (data início e fim)
     * @param {string} start - Data de início
     * @param {string} end - Data de fim
     * @returns {object} { isValid: boolean, errors: string[] }
     */
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
        };
    },

    /**
     * Valida dados completos do medicamento
     * @param {object} data - Dados do medicamento
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    medication(data) {
        const errors = [];

        const nameValidation = this.name(data.name);
        errors.push(...nameValidation.errors);

        const timeValidation = this.time(
            data.hourfirstdose || data.hournextdose,
        );
        errors.push(...timeValidation.errors);

        const intervalValidation = this.interval(data.intervalinhours);
        errors.push(...intervalValidation.errors);

        if (data.periodstart || data.periodend) {
            const periodValidation = this.period(
                data.periodstart,
                data.periodend,
            );
            errors.push(...periodValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },
};
