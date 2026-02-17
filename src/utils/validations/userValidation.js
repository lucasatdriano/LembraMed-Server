export const validationUser = {
    /**
     * Valida nome do usuário
     * @param {string} name - Nome do usuário
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    userName(name) {
        const errors = [];

        if (!name || name.trim().length === 0) {
            errors.push('Nome é obrigatório');
        } else if (name.trim().length < 3) {
            errors.push('Nome deve ter pelo menos 3 caracteres');
        } else if (name.trim().length > 50) {
            errors.push('Nome deve ter no máximo 50 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Valida username
     * @param {string} username - Nome de usuário
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    username(username) {
        const errors = [];

        if (!username || username.trim().length === 0) {
            errors.push('Username é obrigatório');
        } else if (username.length < 2) {
            errors.push('Username deve ter pelo menos 2 caracteres');
        } else if (username.length > 30) {
            errors.push('Username deve ter no máximo 30 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Valida senha
     * @param {string} password - Senha do usuário
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    password(password) {
        const errors = [];

        if (!password) {
            errors.push('Senha é obrigatória');
        } else if (password.length < 4) {
            errors.push('Senha deve ter pelo menos 4 caracteres');
        } else if (password.length > 15) {
            errors.push('Senha deve ter no máximo 15 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Valida credenciais de login
     * @param {object} data - Dados de login
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    login(data) {
        const errors = [];

        if (!data.username || data.username.trim().length === 0) {
            errors.push('Username é obrigatório');
        }

        if (!data.password) {
            errors.push('Senha é obrigatória');
        }

        if (!data.deviceId) {
            errors.push('DeviceId é obrigatório');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Valida dados completos de registro
     * @param {object} data - Dados de registro
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    register(data) {
        const errors = [];

        const nameValidation = this.userName(data.name);
        errors.push(...nameValidation.errors);

        const passwordValidation = this.password(data.password);
        errors.push(...passwordValidation.errors);

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Valida email
     * @param {string} email - Email do usuário
     * @returns {object} { isValid: boolean, errors: string[] }
     */
    email(email) {
        const errors = [];

        if (!email) {
            errors.push('Email é obrigatório');
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push('Formato de email inválido');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },
};
