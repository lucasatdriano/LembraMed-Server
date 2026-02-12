import { Op } from 'sequelize';
import { models } from '../models/index.js';

export async function getContacts(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    try {
        const offset = (page - 1) * limit;

        const { count, rows: contacts } = await models.Contact.findAndCountAll({
            where: { userid: userId },
            attributes: ['id', 'name', 'numberphone'],
            limit: parseInt(limit),
            offset: offset,
            order: [['name', 'ASC']],
        });

        res.json({
            contacts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                hasNext: offset + contacts.length < count,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar contatos.',
            details: error.message,
        });
    }
}

export async function getContactById(req, res) {
    const { contactid } = req.params;
    const userId = req.user.userId;

    try {
        const contact = await models.Contact.findOne({
            where: {
                id: contactid,
                userid: userId,
            },
            attributes: ['id', 'name', 'numberphone'],
        });

        if (!contact) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }

        res.json(contact);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar contato.',
            details: error.message,
        });
    }
}

export async function findContacts(req, res) {
    const { search, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    try {
        const whereClause = { userid: userId };
        const offset = (page - 1) * limit;

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

        res.json({
            contacts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                hasNext: offset + contacts.length < count,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar contato.',
            details: error.message,
        });
    }
}

export async function createContact(req, res) {
    const userId = req.user.userId;
    const { name, numberphone } = req.body;

    try {
        const newContact = await models.Contact.create({
            name: name.toLowerCase(),
            numberphone,
            userid: userId,
        });

        res.status(201).json(newContact);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao criar contato.',
            details: error.message,
        });
    }
}

export async function updateContact(req, res) {
    const { contactid } = req.params;
    const userId = req.user.userId;
    const { name, numberphone } = req.body;

    try {
        const contact = await models.Contact.findOne({
            where: {
                id: contactid,
                userid: userId,
            },
        });

        if (!contact) {
            return res.status(404).json({ error: 'Contato não encontrado.' });
        }

        contact.name = name.toLowerCase() || contact.name;
        contact.numberphone = numberphone || contact.numberphone;

        await contact.save();

        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao atualizar contato.',
            details: error.message,
        });
    }
}

export async function deleteContact(req, res) {
    const { contactid } = req.params;
    const userId = req.user.userId;

    try {
        const contact = await models.Contact.findOne({
            where: {
                id: contactid,
                userid: userId,
            },
        });

        if (!contact) {
            return res.status(404).json({
                error: 'Contato não encontrado.',
            });
        }

        const nameContact = contact.name;
        await contact.destroy();

        res.status(200).json({
            message: `Contato de ${nameContact} deletado com sucesso.`,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao deletar contato.',
            details: error.message,
        });
    }
}
