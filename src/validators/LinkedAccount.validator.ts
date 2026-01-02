import { body } from 'express-validator';

export const validateLinkedAccount = [
  body('userId')
    .isUUID()
    .withMessage('Please provide a valid user ID'),
  
  body('accountId')
    .isUUID()
    .withMessage('Please provide a valid account ID'),
  
  body('externalAccountType')
    .isIn(['bank', 'card'])
    .withMessage('Invalid external account type'),
  
  body('externalAccountData')
    .isObject()
    .withMessage('External account data must be an object'),
  
  body('externalAccountData.accountNumber')
    .if(body('externalAccountType').equals('bank'))
    .notEmpty()
    .withMessage('Bank account number is required'),
  
  body('externalAccountData.routingNumber')
    .if(body('externalAccountType').equals('bank'))
    .notEmpty()
    .withMessage('Routing number is required'),
  
  body('externalAccountData.cardNumber')
    .if(body('externalAccountType').equals('card'))
    .matches(/^\d{16}$/)
    .withMessage('Card number must be 16 digits'),
  
  body('externalAccountData.expiryDate')
    .if(body('externalAccountType').equals('card'))
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('Expiry date must be in MM/YY format'),
  
  body('externalAccountData.cvv')
    .if(body('externalAccountType').equals('card'))
    .matches(/^\d{3,4}$/)
    .withMessage('CVV must be 3 or 4 digits'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'expired'])
    .withMessage('Invalid status')
];