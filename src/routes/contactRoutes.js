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

router.get('/:userid', findContacts);
router.get('/:userid/:contactid', getContactById);
router.post('/:userid', createContact);
router.put('/:userid/:contactid', updateContact);
router.delete('/:userid/:contactid', deleteContact);

export default router;
