import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
    createContact,
    deleteContact,
    findContacts,
    getContactById,
    updateContact,
} from '../controllers/contact.controller.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/search', findContacts);
router.get('/:contactid', getContactById);
router.post('/', createContact);
router.put('/:contactid', updateContact);
router.delete('/:contactid', deleteContact);

export default router;
