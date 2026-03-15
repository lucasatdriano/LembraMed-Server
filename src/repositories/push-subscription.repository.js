import { models } from '../models/index.js';

export class PushSubscriptionRepository {
    static async findAllSubscriptions(userId) {
        return models.PushSubscription.findAll({
            where: { userid: userId },
        });
    }

    static async upsertPushSubscription(data) {
        return models.PushSubscription.upsert(data);
    }

    static async deleteSubscription(userId, deviceId) {
        return models.PushSubscription.destroy({
            where: { userid: userId, deviceid: deviceId },
        });
    }
}
