import { Op } from 'sequelize';
import { ContactRepository } from '../../repositories/contact.repository.js';

export class ContactService {
    static async findContacts(userId, search, page = 1, limit = 20) {
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const offset = (pageNumber - 1) * limitNumber;

        const where = { userid: userId };

        if (search) {
            const isNumber = /^\d+$/.test(search);

            where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];

            if (isNumber) {
                where[Op.or].push({
                    numberphone: { [Op.like]: `%${search}%` },
                });
            }
        }

        const { count, rows } = await ContactRepository.findAndCount(
            where,
            limitNumber,
            offset,
        );

        return {
            contacts: rows,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(count / limitNumber),
                totalRecords: count,
                hasNext: offset + rows.length < count,
                hasPrev: pageNumber > 1,
            },
        };
    }

    static async getContactById(userId, contactId) {
        return ContactRepository.findById(userId, contactId);
    }

    static async createContact(userId, name, numberphone) {
        return ContactRepository.create({
            name: name.toLowerCase().trim(),
            numberphone: numberphone.trim(),
            userid: userId,
        });
    }

    static async updateContact(userId, contactId, name, numberphone) {
        const contact = await ContactRepository.findById(userId, contactId);

        if (!contact) return null;

        if (name) contact.name = name.toLowerCase().trim();
        if (numberphone) contact.numberphone = numberphone.trim();

        await ContactRepository.update(contact);

        return contact;
    }

    static async deleteContact(userId, contactId) {
        const contact = await ContactRepository.findById(userId, contactId);

        if (!contact) return null;

        const contactName = contact.name;
        const contactNumber = contact.numberphone;

        await ContactRepository.delete(contact);

        return { contactName, contactNumber };
    }
}
