"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBulkUpdate = exports.validateComplianceSetting = void 0;
const express_validator_1 = require("express-validator");
exports.validateComplianceSetting = [
    (0, express_validator_1.body)('settingType')
        .isIn(['transaction_limit', 'aml_rule', 'security_policy'])
        .withMessage('Invalid setting type'),
    (0, express_validator_1.body)('settingKey')
        .trim()
        .notEmpty()
        .withMessage('Setting key is required')
        .matches(/^[a-z0-9_]+$/)
        .withMessage('Setting key must contain only lowercase letters, numbers, and underscores')
        .isLength({ max: 50 })
        .withMessage('Setting key must not exceed 50 characters'),
    (0, express_validator_1.body)('settingValue')
        .notEmpty()
        .withMessage('Setting value is required'),
    (0, express_validator_1.body)('active')
        .optional()
        .isBoolean()
        .withMessage('Active must be a boolean value')
];
exports.validateBulkUpdate = [
    (0, express_validator_1.body)('settings')
        .isArray({ min: 1 })
        .withMessage('Settings must be an array with at least one item'),
    (0, express_validator_1.body)('settings.*.id')
        .isUUID()
        .withMessage('Each setting must have a valid ID'),
    (0, express_validator_1.body)('settings.*.updates')
        .isObject()
        .withMessage('Each setting must have updates object'),
    (0, express_validator_1.body)('settings.*.updates.settingValue')
        .optional()
        .notEmpty()
        .withMessage('Setting value cannot be empty'),
    (0, express_validator_1.body)('settings.*.updates.active')
        .optional()
        .isBoolean()
        .withMessage('Active must be a boolean value')
];
