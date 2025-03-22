import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    createContact,
    deleteContact,
    findContacts,
    getContactById,
    getContacts,
    updateContact,
} from '../controllers/contactController.js';

const router = express.Router();

router.get('/:userid', authMiddleware, findContacts);
router.get('/:userid/:contactId', authMiddleware, getContactById);
router.post('/:userid', authMiddleware, createContact);
router.put('/:userid/:contactId', authMiddleware, updateContact);
router.delete('/:userid/:contactId', authMiddleware, deleteContact);

export default router;
