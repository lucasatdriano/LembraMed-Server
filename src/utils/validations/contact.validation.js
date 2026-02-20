export const validationContact = {
    /**
     * Valida nome do contato
     * @param {string} name - Nome do contato
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    contactName(name) {
        const errors = [];

        if (!name || name.trim().length === 0) {
            errors.push('Nome do contato é obrigatório');
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
     * Valida número de telefone
     * @param {string} phone - Número de telefone
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    phoneNumber(phone) {
        const errors = [];

        if (!phone) {
            errors.push('Número de telefone é obrigatório');
            return { isValid: false, errors };
        }

        const numbersOnly = phone.replace(/\D/g, '');

        if (numbersOnly.length < 10 || numbersOnly.length > 11) {
            errors.push(
                'Número de telefone deve ter 10 ou 11 dígitos (incluindo DDD)',
            );
        }

        if (!/^\d+$/.test(numbersOnly)) {
            errors.push('Número de telefone deve conter apenas dígitos');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Valida dados completos do contato
     * @param {object} data - Dados do contato
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    contact(data) {
        const errors = [];

        const nameValidation = this.contactName(data.name);
        errors.push(...nameValidation.errors);

        const phoneValidation = this.phoneNumber(data.numberphone);
        errors.push(...phoneValidation.errors);

        return {
            isValid: errors.length === 0,
            errors,
        };
    },
};
