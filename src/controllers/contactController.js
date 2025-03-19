import { Op } from 'sequelize';
import { models } from '../models/index.js';

export async function getContacts(req, res) {
    const { userId } = req.params;

    if (!req.authenticatedUser) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
        const contacts = await models.Contact.findAll({
            where: { userId: userId },
        });

        res.json(contacts);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar contatos.',
            details: error.message,
        });
    }
}

export async function getContactById(req, res) {
    const { userId, contactId } = req.params;

    if (!req.authenticatedUser) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
        const contact = await models.Contact.findByPk(contactId, {
            attributes: ['id', 'name', 'numberPhone'],
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
    const { userId } = req.params;
    const { search } = req.query;

    if (!req.authenticatedUser) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    try {
        const whereClause = { userId };

        if (search) {
            const isNumber = /^\d+$/.test(search);

            whereClause[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];

            if (isNumber) {
                whereClause[Op.or].push({
                    numberPhone: { [Op.like]: `%${search}%` },
                });
            }
        }

        const contacts = await models.Contact.findAll({ where: whereClause });

        if (contacts.length === 0) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }

        res.json(contacts);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar contato.',
            details: error.message,
        });
    }
}

export async function createContact(req, res) {
    const { userId } = req.params;
    const { name, numberPhone } = req.body;

    try {
        const newContact = await models.Contact.create({
            name,
            numberPhone,
            userId,
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
    const { userId, contactId } = req.params;
    const { name, numberPhone } = req.body;

    try {
        const contact = await models.Contact.findByPk(contactId);

        if (!contact || contact.userId !== userId) {
            return res.status(404).json({ error: 'Contato não encontrado.' });
        }

        contact.name = name || contact.name;
        contact.numberPhone = numberPhone || contact.numberPhone;

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
    const { userId, contactId } = req.params;

    try {
        const contact = await models.Contact.findByPk(contactId);

        if (!contact || contact.userId !== userId) {
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
