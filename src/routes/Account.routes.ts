import { Router } from 'express';
import AccountController from '../controllers/Account.controller';
import { validateAccount, validateBalanceUpdate } from '../validators/Account.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// User routes (authenticated users can access their own accounts)
router.get('/my-accounts', authenticate, AccountController.getUserAccounts);

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), AccountController.getAllAccounts);
router.get('/:id', authenticate, AccountController.getAccountById); // Users can view if they own it
router.get('/account/:accountNumber', authenticate, AccountController.getAccountByAccountNumber); // Users can view if they own it
router.post('/', authenticate, authorize(['admin', 'super_admin']), validateAccount, AccountController.createAccount);
router.put('/:id', authenticate, authorize(['admin', 'super_admin']), validateAccount, AccountController.updateAccount);
router.delete('/:id', authenticate, authorize(['super_admin']), AccountController.deleteAccount);
router.put('/:id/balance', authenticate, authorize(['admin', 'super_admin']), validateBalanceUpdate, AccountController.updateBalance);

// Get accounts by user ID
router.get('/user/:userId', authenticate, authorize(['admin', 'super_admin']), AccountController.getUserAccounts);

export default router;