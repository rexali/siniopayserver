import { body } from 'express-validator';

export const validateAccount = [
  body('userId')
    .isUUID()
    .withMessage('Please provide a valid user ID'),
  
  body('accountNumber')
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Account number must be between 8 and 20 characters'),
  
  body('accountType')
    .optional()
    .isIn(['wallet', 'bank_linked'])
    .withMessage('Invalid account type'),
  
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance must be a positive number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'frozen', 'closed'])
    .withMessage('Invalid status')
];

export const validateBalanceUpdate = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('operation')
    .isIn(['add', 'subtract'])
    .withMessage('Operation must be either "add" or "subtract"')
];