import { Router } from 'express';
import LinkedAccountController from '../controllers/LinkedAccount.controller';
import { validateLinkedAccount } from '../validators/LinkedAccount.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// User routes
router.get('/user/:userId', authenticate, LinkedAccountController.getUserLinkedAccounts);
router.post('/', authenticate, validateLinkedAccount, LinkedAccountController.createLinkedAccount);
router.put('/:id', authenticate, validateLinkedAccount, LinkedAccountController.updateLinkedAccount);
router.delete('/:id', authenticate, LinkedAccountController.deleteLinkedAccount);

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), LinkedAccountController.getAllLinkedAccounts);
router.get('/:id', authenticate, authorize(['admin', 'super_admin']), LinkedAccountController.getLinkedAccountById);
router.get('/account/:accountId', authenticate, authorize(['admin', 'super_admin']), LinkedAccountController.getAccountLinkedAccounts);

export default router;