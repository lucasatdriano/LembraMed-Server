import { ContactService } from '../services/contact.service.js';
import { validationContact } from '../utils/validations/contact.validation.js';

export async function getContacts(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    try {
        const result = await ContactService.getContacts(userId, page, limit);

        res.json(result);
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
        const contact = await ContactService.getContactById(userId, contactid);

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
        const result = await ContactService.findContacts(
            userId,
            search,
            page,
            limit,
        );

        res.json(result);
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
        const validationResult = validationContact.contact({
            name,
            numberphone,
        });

        if (!validationResult.isValid) {
            console.log('❌ Erros de validação:', validationResult.errors);
            return res.status(400).json({
                error: 'Dados inválidos',
                details: validationResult.errors,
            });
        }

        const newContact = await ContactService.createContact(
            userId,
            name,
            numberphone,
        );

        res.status(201).json(newContact);
    } catch (error) {
        console.error('❌ Erro ao criar contato:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Erro ao criar contato',
                details: ['Este número de telefone já está cadastrado'],
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Erro de validação',
                details: error.errors.map((e) => e.message),
            });
        }

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
        const errors = [];

        if (name) {
            const nameValidation = validationContact.contactName(name);
            errors.push(...nameValidation.errors);
        }

        if (numberphone) {
            const phoneValidation = validationContact.phoneNumber(numberphone);
            errors.push(...phoneValidation.errors);
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors,
            });
        }

        const updatedContact = await ContactService.updateContact(
            userId,
            contactid,
            name,
            numberphone,
        );

        if (!updatedContact) {
            return res.status(404).json({ error: 'Contato não encontrado.' });
        }

        res.status(200).json(updatedContact);
    } catch (error) {
        console.error('❌ Erro ao atualizar contato:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Erro ao atualizar contato',
                details: [
                    'Este número de telefone já está cadastrado para outro contato',
                ],
            });
        }

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Erro de validação',
                details: error.errors.map((e) => e.message),
            });
        }

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
        const result = await ContactService.deleteContact(userId, contactid);

        if (!result) {
            return res.status(404).json({
                error: 'Contato não encontrado.',
            });
        }

        res.status(200).json({
            message: `Contato de ${result.contactName} deletado com sucesso.`,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao deletar contato.',
            details: error.message,
        });
    }
}
