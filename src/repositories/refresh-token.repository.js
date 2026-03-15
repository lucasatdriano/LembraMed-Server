import { Op } from 'sequelize';
import { models } from '../models/index.js';

export class refreshTokenRepository {
    static async findRefreshToken(data) {
        return models.RefreshToken.findOne(data);
    }

    static async createRefreshToken(data) {
        return models.RefreshToken.create(data);
    }

    static async revokeRefreshToken(whereClause) {
        await models.RefreshToken.update(
            { revoked: true },
            { where: whereClause },
        );
    }

    static async deleteRefreshToken(date) {
        return models.RefreshToken.destroy({
            where: {
                [Op.or]: [{ revoked: true }, { expiresat: { [Op.lt]: date } }],
            },
        });
    }
}
