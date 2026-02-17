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
    let baseUsername = generateBaseUsername(name);
    let count = 1;

    while (await models.User.findOne({ where: { username: baseUsername } })) {
        baseUsername = `${baseUsername}${count}`;
        count++;
    }

    return baseUsername;
}
