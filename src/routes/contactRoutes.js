import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    createContact,
    deleteContact,
    findContacts,
    getContactById,
    updateContact,
} from '../controllers/contactController.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/search', findContacts);
router.get('/:contactid', getContactById);
router.post('/', createContact);
router.put('/:contactid', updateContact);
router.delete('/:contactid', deleteContact);

export default router;
