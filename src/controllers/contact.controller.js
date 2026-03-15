import { ContactService } from '../services/contact/contact.service.js';
import { validationContact } from '../utils/validations/contact.validation.js';
import { AppError } from '../utils/errors/app.error.js';

export async function findContacts(req, res) {
    const { search, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    const result = await ContactService.findContacts(
        userId,
        search,
        page,
        limit,
    );

    return res.json(result);
}

export async function getContactById(req, res) {
    const { contactid } = req.params;
    const userId = req.user.userId;

    const contact = await ContactService.getContactById(userId, contactid);

    if (!contact) {
        throw new AppError('Contato não encontrado', 404);
    }

    return res.json(contact);
}

export async function createContact(req, res) {
    const userId = req.user.userId;
    const { name, numberphone } = req.body;

    const validation = validationContact.contact({
        name,
        numberphone,
    });

    if (!validation.isValid) {
        throw new AppError('Dados inválidos', 400);
    }

    const { normalized } = validation;

    const newContact = await ContactService.createContact(
        userId,
        normalized.name,
        normalized.numberphone,
    );

    return res.status(201).json(newContact);
}

export async function updateContact(req, res) {
    const { contactid } = req.params;
    const userId = req.user.userId;
    const { name, numberphone } = req.body;

    const validations = [];

    if (name) validations.push(validationContact.contactName(name));
    if (numberphone)
        validations.push(validationContact.phoneNumber(numberphone));

    const errors = validations.flatMap((v) => v.errors);

    if (errors.length > 0) {
        throw new AppError('Dados inválidos', 400);
    }

    const updatedContact = await ContactService.updateContact(
        userId,
        contactid,
        name,
        numberphone,
    );

    if (!updatedContact) {
        throw new AppError('Contato não encontrado', 404);
    }

    return res.json(updatedContact);
}

export async function deleteContact(req, res) {
    const { contactid } = req.params;
    const userId = req.user.userId;

    const result = await ContactService.deleteContact(userId, contactid);

    if (!result) {
        throw new AppError('Contato não encontrado', 404);
    }

    return res.json({
        message: `Contato de ${result.contactName} deletado com sucesso.`,
    });
}
