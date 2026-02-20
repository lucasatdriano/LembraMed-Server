import { models } from '../../models/index.js';

function generateBaseUsername(name) {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-zA-Z0-9.]/g, '');
}

export async function generateUniqueUsername(name) {
    const baseUsername = generateBaseUsername(name);

    const existingUser = await models.User.findOne({
        where: { username: baseUsername },
    });

    if (existingUser) {
        return null;
    }

    return baseUsername;
}
