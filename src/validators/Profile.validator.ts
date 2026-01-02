import { body } from 'express-validator';

export const validateProfile = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][0-9]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('role')
    .optional()
    .isIn(['customer', 'admin', 'super_admin'])
    .withMessage('Invalid role'),
  
  body('status')
    .optional()
    .isIn(['active', 'suspended', 'blocked'])
    .withMessage('Invalid status'),
  
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be a valid object')
];

export const validateProfileUpdate = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][0-9]{0,15}$/)
    .withMessage('Please provide a valid phone number')
];