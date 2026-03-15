import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/handlers/async-handler.js';
import {
    createContact,
    deleteContact,
    findContacts,
    getContactById,
    updateContact,
} from '../controllers/contact.controller.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/search', asyncHandler(findContacts));
router.get('/:contactid', asyncHandler(getContactById));
router.post('/', asyncHandler(createContact));
router.put('/:contactid', asyncHandler(updateContact));
router.delete('/:contactid', asyncHandler(deleteContact));

export default router;
