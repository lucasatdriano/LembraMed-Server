export const validationUser = {
    userName(name) {
        const errors = [];

        if (!name?.trim()) {
            errors.push('Nome é obrigatório');
        }

        if (name && name.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        if (name && name.trim().length > 30) {
            errors.push('Nome deve ter no máximo 30 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    username(username) {
        const errors = [];

        if (!username?.trim()) {
            errors.push('Username é obrigatório');
        }

        if (username && username.trim().length < 2) {
            errors.push('Username deve ter pelo menos 2 caracteres');
        }

        if (username && username.trim().length > 30) {
            errors.push('Username deve ter no máximo 30 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    password(password) {
        const errors = [];

        if (!password) {
            errors.push('Senha é obrigatória');
        }

        if (password && password.length < 4) {
            errors.push('Senha deve ter pelo menos 4 caracteres');
        }

        if (password && password.length > 15) {
            errors.push('Senha deve ter no máximo 15 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

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

    login(data) {
        const errors = [];

        const usernameValidation = this.username(data.username);
        const passwordValidation = this.password(data.password);

        errors.push(...usernameValidation.errors);
        errors.push(...passwordValidation.errors);

        if (!data.deviceId) {
            errors.push('DeviceId é obrigatório');
        }

        return {
            isValid: errors.length === 0,
            errors,
            normalized: {
                username: data.username?.trim().toLowerCase(),
                deviceId: data.deviceId,
            },
        };
    },

    register(data) {
        const errors = [];

        const nameValidation = this.userName(data.name);
        const passwordValidation = this.password(data.password);

        errors.push(...nameValidation.errors);
        errors.push(...passwordValidation.errors);

        return {
            isValid: errors.length === 0,
            errors,
            normalized: {
                name: data.name?.trim(),
                password: data.password,
            },
        };
    },
};
