"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAdminUserUpdate = exports.validateUserUpdate = exports.validateResetPassword = exports.validateForgotPassword = exports.validateTokenVerification = exports.validateEmailVerification = exports.validateLogin = exports.validateRegistration = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegistration = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('firstName')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .matches(/^[\+]?[1-9][0-9]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('dateOfBirth')
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
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
exports.validateEmailVerification = [
    (0, express_validator_1.body)('token')
        .optional()
        .isString()
        .withMessage('Token must be a string'),
    (0, express_validator_1.body)('code')
        .optional()
        .isString()
        .withMessage('Code must be a string')
        .isLength({ min: 6, max: 6 })
        .withMessage('Code must be 6 digits')
];
exports.validateTokenVerification = [
    (0, express_validator_1.body)('token')
        .optional()
        .isString()
        .withMessage('Token must be a string')
];
exports.validateForgotPassword = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
];
exports.validateResetPassword = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];
exports.validateUserUpdate = [
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .optional()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    (0, express_validator_1.body)('currentPassword')
        .if((0, express_validator_1.body)('password').exists())
        .notEmpty()
        .withMessage('Current password is required to change password'),
    (0, express_validator_1.body)('twoFactorAuthentication')
        .optional()
        .isBoolean()
        .withMessage('Two-factor authentication must be a boolean value')
];
exports.validateAdminUserUpdate = [
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['customer', 'admin', 'super_admin'])
        .withMessage('Invalid role'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['pending', 'active', 'suspended', 'blocked'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('twoFactorAuthentication')
        .optional()
        .isBoolean()
        .withMessage('Two-factor authentication must be a boolean value')
];
