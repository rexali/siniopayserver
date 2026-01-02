
import { Router } from 'express';
import TransactionController from '../controllers/Transaction.controller';
import { validateTransaction } from '../validators/Transaction.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// User routes
router.post('/', authenticate, validateTransaction, TransactionController.createTransaction);
router.get('/account/:accountId', authenticate, TransactionController.getAccountTransactions);

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), TransactionController.getAllTransactions);
router.get('/:id', authenticate, TransactionController.getTransactionById);
router.get('/users/:id', authenticate, TransactionController.getTransactionsByUser);
router.put('/:id', authenticate, authorize(['admin', 'super_admin']), validateTransaction, TransactionController.updateTransaction);

export default router;