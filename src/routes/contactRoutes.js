import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    createContact,
    deleteContact,
    findContacts,
    getContactById,
    getContacts,
    updateContact,
} from '../controllers/contactController';

const router = express.Router();

router.get('/', authMiddleware, findContacts);
router.get('/:contactId', authMiddleware, getContactById);
router.post('/', authMiddleware, createContact);
router.put('/:contactId', authMiddleware, updateContact);
router.delete('/:contactId', authMiddleware, deleteContact);
