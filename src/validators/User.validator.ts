import { body } from 'express-validator';

export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
   body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][0-9]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        throw new Error('You must be at least 18 years old');
      }
      return true;
    })
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateEmailVerification = [
  body('token')
    .optional()
    .isString()
    .withMessage('Token must be a string'),
  
  body('code')
    .optional()
    .isString()
    .withMessage('Code must be a string')
    .isLength({ min: 6, max: 6 })
    .withMessage('Code must be 6 digits')
];


export const validateVerificationCode = [
  body('token')
    .optional()
    .isString()
    .withMessage('Token must be a string'),
  
  body('code')
    .optional()
    .isString()
    .withMessage('Code must be a string')
    .isLength({ min: 6, max: 6 })
    .withMessage('Code must be 6 digits')
];


export const validateTokenVerification = [
  body('token')
    .optional()
    .isString()
    .withMessage('Token must be a string')
];

export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

export const validateUserUpdate = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('currentPassword')
    .if(body('password').exists())
    .notEmpty()
    .withMessage('Current password is required to change password'),
  
  body('twoFactorAuthentication')
    .optional()
    .isBoolean()
    .withMessage('Two-factor authentication must be a boolean value')
];

export const validateAdminUserUpdate = [
  body('role')
    .optional()
    .isIn(['customer', 'admin', 'super_admin'])
    .withMessage('Invalid role'),
  
  body('status')
    .optional()
    .isIn(['pending', 'active', 'suspended', 'blocked'])
    .withMessage('Invalid status'),
  
  body('twoFactorAuthentication')
    .optional()
    .isBoolean()
    .withMessage('Two-factor authentication must be a boolean value')
];