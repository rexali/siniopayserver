"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateKYCUpdate = exports.validateKYCVerification = void 0;
const express_validator_1 = require("express-validator");
exports.validateKYCVerification = [
    (0, express_validator_1.body)('userId')
        .isUUID()
        .withMessage('Please provide a valid user ID'),
    (0, express_validator_1.body)('verificationType')
        .isIn(['identity', 'address', 'document'])
        .withMessage('Invalid verification type'),
    (0, express_validator_1.body)('documents')
        .optional()
        .isArray()
        .withMessage('Documents must be an array'),
    (0, express_validator_1.body)('documents.*.type')
        .if((0, express_validator_1.body)('documents').exists())
        .notEmpty()
        .withMessage('Document type is required'),
    (0, express_validator_1.body)('documents.*.url')
        .if((0, express_validator_1.body)('documents').exists())
        .isURL()
        .withMessage('Document URL must be valid'),
    (0, express_validator_1.body)('documents.*.number')
        .if((0, express_validator_1.body)('documents').exists())
        .notEmpty()
        .withMessage('Document number is required')
];
exports.validateKYCUpdate = [
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'approved', 'rejected', 'under_review'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('rejectionReason')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Rejection reason must not exceed 1000 characters'),
    (0, express_validator_1.body)('verifiedBy')
        .optional()
        .isUUID()
        .withMessage('Please provide a valid verifier ID')
];
