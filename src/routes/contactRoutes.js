import express from 'express';
// import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    createContact,
    deleteContact,
    findContacts,
    getContactById,
    getContacts,
    updateContact,
} from '../controllers/contactController.js';

const router = express.Router();

router.get('/:userid', findContacts);
router.get('/:userid/:contactId', getContactById);
router.post('/:userid', createContact);
router.put('/:userid/:contactId', updateContact);
router.delete('/:userid/:contactId', deleteContact);

export default router;
