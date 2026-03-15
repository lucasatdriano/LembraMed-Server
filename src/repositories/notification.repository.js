import { models } from '../models/index.js';

export class NotificationRepository {
    static create(data) {
        return models.Notification.create(data);
    }

    static findByUser(userId, limit, offset) {
        return models.Notification.findAll({
            where: { userid: userId },
            attributes: ['id', 'title', 'message', 'sentat', 'readat'],
            order: [['sentat', 'DESC']],
            limit,
            offset,
        });
    }

    static findOne(userId, notificationId) {
        return models.Notification.findOne({
            where: { id: notificationId, userid: userId },
        });
    }
}
