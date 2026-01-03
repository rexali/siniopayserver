"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBalanceUpdate = exports.validateAccount = void 0;
const express_validator_1 = require("express-validator");
exports.validateAccount = [
    (0, express_validator_1.body)('userId')
        .isUUID()
        .withMessage('Please provide a valid user ID'),
    (0, express_validator_1.body)('accountNumber')
        .trim()
        .isLength({ min: 8, max: 20 })
        .withMessage('Account number must be between 8 and 20 characters'),
    (0, express_validator_1.body)('accountType')
        .optional()
        .isIn(['wallet', 'bank_linked'])
        .withMessage('Invalid account type'),
    (0, express_validator_1.body)('balance')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Balance must be a positive number'),
    (0, express_validator_1.body)('currency')
        .optional()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency must be 3 characters'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['active', 'frozen', 'closed'])
        .withMessage('Invalid status')
];
exports.validateBalanceUpdate = [
    (0, express_validator_1.body)('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('operation')
        .isIn(['add', 'subtract'])
        .withMessage('Operation must be either "add" or "subtract"')
];
