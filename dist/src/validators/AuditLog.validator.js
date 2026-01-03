"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuditLog = void 0;
const express_validator_1 = require("express-validator");
exports.validateAuditLog = [
    (0, express_validator_1.body)('adminId')
        .isUUID()
        .withMessage('Please provide a valid admin ID'),
    (0, express_validator_1.body)('action')
        .trim()
        .notEmpty()
        .withMessage('Action is required')
        .isLength({ max: 100 })
        .withMessage('Action must not exceed 100 characters'),
    (0, express_validator_1.body)('resourceType')
        .trim()
        .notEmpty()
        .withMessage('Resource type is required')
        .isLength({ max: 50 })
        .withMessage('Resource type must not exceed 50 characters'),
    (0, express_validator_1.body)('resourceId')
        .optional()
        .isUUID()
        .withMessage('Please provide a valid resource ID'),
    (0, express_validator_1.body)('details')
        .optional()
        .isObject()
        .withMessage('Details must be an object')
];
