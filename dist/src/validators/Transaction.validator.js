"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransactionUpdate = exports.validateTransaction = void 0;
const express_validator_1 = require("express-validator");
exports.validateTransaction = [
    (0, express_validator_1.body)('fromAccountId')
        .isUUID()
        .withMessage('Please provide a valid from account ID'),
    (0, express_validator_1.body)('toAccountId')
        .isUUID()
        .withMessage('Please provide a valid to account ID'),
    (0, express_validator_1.body)('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),
    (0, express_validator_1.body)('currency')
        .optional()
        .isLength({ min: 2, max: 3 })
        .withMessage('Currency must be 3 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['transfer', 'payment', 'bill_payment', 'refund', 'reversal'])
        .withMessage('Invalid transaction type'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('metadata')
        .optional()
        .isObject()
        .withMessage('Metadata must be a valid object')
];
exports.validateTransactionUpdate = [
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['pending', 'completed', 'failed', 'flagged', 'reversed'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('flaggedReason')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Flagged reason must not exceed 1000 characters')
];
