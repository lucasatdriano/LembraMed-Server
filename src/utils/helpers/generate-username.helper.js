import { UserRepository } from '../../repositories/user.repository.js';

const generateBaseUsername = (name) => {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-zA-Z0-9.]/g, '');
};

export const generateUniqueUsername = async (name) => {
    const baseUsername = generateBaseUsername(name);

    const existingUser = await UserRepository.findByUsername(baseUsername);

    if (existingUser) {
        return null;
    }

    return baseUsername;
};
