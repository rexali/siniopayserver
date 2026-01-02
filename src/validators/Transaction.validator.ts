import { body } from 'express-validator';

export const validateTransaction = [
  body('fromAccountId')
    .isUUID()
    .withMessage('Please provide a valid from account ID'),
  
  body('toAccountId')
    .isUUID()
    .withMessage('Please provide a valid to account ID'),
  
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('currency')
    .optional()
    .isLength({ min: 2, max: 3 })
    .withMessage('Currency must be 3 characters'),
  
  body('type')
    .isIn(['transfer', 'payment', 'bill_payment', 'refund', 'reversal'])
    .withMessage('Invalid transaction type'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be a valid object')
];

export const validateTransactionUpdate = [
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'flagged', 'reversed'])
    .withMessage('Invalid status'),
  
  body('flaggedReason')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Flagged reason must not exceed 1000 characters')
];