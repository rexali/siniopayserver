"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLinkedAccount = void 0;
const express_validator_1 = require("express-validator");
exports.validateLinkedAccount = [
    (0, express_validator_1.body)('userId')
        .isUUID()
        .withMessage('Please provide a valid user ID'),
    (0, express_validator_1.body)('accountId')
        .isUUID()
        .withMessage('Please provide a valid account ID'),
    (0, express_validator_1.body)('externalAccountType')
        .isIn(['bank', 'card'])
        .withMessage('Invalid external account type'),
    (0, express_validator_1.body)('externalAccountData')
        .isObject()
        .withMessage('External account data must be an object'),
    (0, express_validator_1.body)('externalAccountData.accountNumber')
        .if((0, express_validator_1.body)('externalAccountType').equals('bank'))
        .notEmpty()
        .withMessage('Bank account number is required'),
    (0, express_validator_1.body)('externalAccountData.routingNumber')
        .if((0, express_validator_1.body)('externalAccountType').equals('bank'))
        .notEmpty()
        .withMessage('Routing number is required'),
    (0, express_validator_1.body)('externalAccountData.cardNumber')
        .if((0, express_validator_1.body)('externalAccountType').equals('card'))
        .matches(/^\d{16}$/)
        .withMessage('Card number must be 16 digits'),
    (0, express_validator_1.body)('externalAccountData.expiryDate')
        .if((0, express_validator_1.body)('externalAccountType').equals('card'))
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
        .withMessage('Expiry date must be in MM/YY format'),
    (0, express_validator_1.body)('externalAccountData.cvv')
        .if((0, express_validator_1.body)('externalAccountType').equals('card'))
        .matches(/^\d{3,4}$/)
        .withMessage('CVV must be 3 or 4 digits'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['active', 'inactive', 'expired'])
        .withMessage('Invalid status')
];
