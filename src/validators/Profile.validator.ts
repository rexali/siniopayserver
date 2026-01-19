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

export const validateProfileUpdate2 = [
  
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('middleName')
    .optional()
    .trim()
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Middle name must be between 2 and 100 characters'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),

  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][0-9]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),

  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be a valid object'),

  body('localGovt')
    .optional()
    .isObject()
    .withMessage('Local Govt must be a valid object'),

  body('state')
    .optional()
    .isObject()
    .withMessage('State must be a valid object'),

  body('country')
    .optional()
    .isObject()
    .withMessage('Country must be a valid object'),

  body('nin')
    .optional()
    .isObject()
    .withMessage('NIN must be a valid object'),

  body('bvn')
    .optional()
    .isObject()
    .withMessage('BVN must be a valid object'),

  body('avatarUrl')
    .optional()
    .isObject()
    .withMessage('Avatar must be a valid object'),

  body('ninUrl')
    .optional()
    .isObject()
    .withMessage('NIN must be a valid object'),

  body('addressUrl')
    .optional()
    .isObject()
    .withMessage('Address must be a valid object')

];