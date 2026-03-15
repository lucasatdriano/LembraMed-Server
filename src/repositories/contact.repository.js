import { models } from '../models/index.js';

export class ContactRepository {
    static findAndCount(where, limit, offset) {
        return models.Contact.findAndCountAll({
            where,
            attributes: ['id', 'name', 'numberphone'],
            limit,
            offset,
            order: [['name', 'ASC']],
        });
    }

    static findById(userId, contactId) {
        return models.Contact.findOne({
            where: { id: contactId, userid: userId },
            attributes: ['id', 'name', 'numberphone'],
        });
    }

    static create(data) {
        return models.Contact.create(data);
    }

    static async update(contact) {
        return contact.save();
    }

    static async delete(contact) {
        return contact.destroy();
    }
}
