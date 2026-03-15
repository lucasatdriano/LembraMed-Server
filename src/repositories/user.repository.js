import { models } from '../models/index.js';

export class UserRepository {
    static async create(data) {
        return models.User.create(data);
    }

    static async findByUsername(username) {
        return models.User.findOne({
            where: { username },
        });
    }

    static async findByEmail(email) {
        return models.User.findOne({
            where: { email },
        });
    }

    static async findById(userId) {
        return models.User.findByPk(userId, {
            attributes: ['id', 'name', 'username', 'createdat'],
        });
    }
}
