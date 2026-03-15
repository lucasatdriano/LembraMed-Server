export const validationContact = {
    contactName(name) {
        const errors = [];

        if (!name?.trim()) {
            errors.push('Nome do contato é obrigatório');
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
        };
    },

    phoneNumber(phone) {
        const errors = [];

        if (!phone) {
            errors.push('Número de telefone é obrigatório');
            return { isValid: false, errors };
        }

        const numbersOnly = phone.replace(/\D/g, '');

        if (numbersOnly.length < 10 || numbersOnly.length > 11) {
            errors.push('Número deve ter 10 ou 11 dígitos (incluindo DDD)');
        }

        return {
            isValid: errors.length === 0,
            errors,
            value: numbersOnly,
        };
    },

    contact(data) {
        const errors = [];

        const nameValidation = this.contactName(data.name);
        const phoneValidation = this.phoneNumber(data.numberphone);

        errors.push(...nameValidation.errors);
        errors.push(...phoneValidation.errors);

        return {
            isValid: errors.length === 0,
            errors,
            normalized: {
                name: data.name?.trim(),
                numberphone: phoneValidation.value,
            },
        };
    },
};
