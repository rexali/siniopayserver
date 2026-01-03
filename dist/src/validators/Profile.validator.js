"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProfileUpdate = exports.validateProfile = void 0;
const express_validator_1 = require("express-validator");
exports.validateProfile = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .matches(/^[\+]?[1-9][0-9]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['customer', 'admin', 'super_admin'])
        .withMessage('Invalid role'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['active', 'suspended', 'blocked'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('address')
        .optional()
        .isObject()
        .withMessage('Address must be a valid object')
];
exports.validateProfileUpdate = [
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('fullName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .matches(/^[\+]?[1-9][0-9]{0,15}$/)
        .withMessage('Please provide a valid phone number')
];
