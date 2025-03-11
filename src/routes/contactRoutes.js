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

router.get('/:userId', authMiddleware, findContacts);
router.get('/:userId/:contactId', authMiddleware, getContactById);
router.post('/:userId', authMiddleware, createContact);
router.put('/:userId/:contactId', authMiddleware, updateContact);
router.delete('/:userId/:contactId', authMiddleware, deleteContact);

export default router;
