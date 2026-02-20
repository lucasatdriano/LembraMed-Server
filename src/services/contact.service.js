import { Op } from 'sequelize';
import { models } from '../models/index.js';

export class ContactService {
    static async getContacts(userId, page, limit) {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;

        const { count, rows: contacts } = await models.Contact.findAndCountAll({
            where: { userid: userId },
            attributes: ['id', 'name', 'numberphone'],
            limit: parseInt(limit),
            offset: offset,
            order: [['name', 'ASC']],
        });

        return {
            contacts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                hasNext: offset + contacts.length < count,
                hasPrev: page > 1,
            },
        };
    }

    static async getContactById(userId, contactId) {
        const contact = await models.Contact.findOne({
            where: {
                id: contactId,
                userid: userId,
            },
            attributes: ['id', 'name', 'numberphone'],
        });

        return contact;
    }

    static async findContacts(userId, search, page, limit) {
        const whereClause = { userid: userId };
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;

        if (search) {
            const searchLower = search.toLowerCase();
            const isNumber = /^\d+$/.test(search);

            whereClause[Op.or] = [
                {
                    name: {
                        [Op.like]: `%${searchLower}%`,
                    },
                },
            ];

            if (isNumber) {
                whereClause[Op.or].push({
                    numberphone: { [Op.like]: `%${searchLower}%` },
                });
            }
        }

        const { count, rows: contacts } = await models.Contact.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'name', 'numberphone'],
            limit: parseInt(limit),
            offset: offset,
            order: [['name', 'ASC']],
        });

        return {
            contacts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                hasNext: offset + contacts.length < count,
                hasPrev: page > 1,
            },
        };
    }

    static async createContact(userId, name, numberphone) {
        const newContact = await models.Contact.create({
            name: name.toLowerCase().trim(),
            numberphone: numberphone.trim(),
            userid: userId,
        });

        return newContact;
    }

    static async updateContact(userId, contactId, name, numberphone) {
        const contact = await models.Contact.findOne({
            where: {
                id: contactId,
                userid: userId,
            },
        });

        if (!contact) {
            return null;
        }

        if (name) contact.name = name.toLowerCase().trim();
        if (numberphone) contact.numberphone = numberphone.trim();

        await contact.save();

        return contact;
    }

    static async deleteContact(userId, contactId) {
        const contact = await models.Contact.findOne({
            where: {
                id: contactId,
                userid: userId,
            },
        });

        if (!contact) {
            return null;
        }

        const contactName = contact.name;
        await contact.destroy();

        return { contactName };
    }
}
