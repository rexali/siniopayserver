"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeviceIdParam = exports.validateDeviceUpdate = exports.validateDeviceRegistration = void 0;
const express_validator_1 = require("express-validator");
exports.validateDeviceRegistration = [
    (0, express_validator_1.body)('deviceId')
        .trim()
        .notEmpty()
        .withMessage('Device ID is required')
        .isLength({ min: 10, max: 255 })
        .withMessage('Device ID must be between 10 and 255 characters')
        .escape(),
    (0, express_validator_1.body)('deviceName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Device name must not exceed 100 characters')
        .escape(),
    (0, express_validator_1.body)('deviceType')
        .optional()
        .isIn(['desktop', 'mobile', 'tablet', 'smart_tv', 'wearable', 'unknown'])
        .withMessage('Invalid device type'),
    (0, express_validator_1.body)('userAgent')
        .trim()
        .notEmpty()
        .withMessage('User agent is required')
        .isLength({ max: 500 })
        .withMessage('User agent must not exceed 500 characters'),
    (0, express_validator_1.body)('fingerprint')
        .optional()
        .isLength({ max: 64 })
        .withMessage('Fingerprint must not exceed 64 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Fingerprint contains invalid characters'),
    (0, express_validator_1.body)('metadata')
        .optional()
        .isObject()
        .withMessage('Metadata must be an object')
];
exports.validateDeviceUpdate = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('Invalid device ID'),
    (0, express_validator_1.body)('deviceName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Device name must not exceed 100 characters')
        .escape(),
    (0, express_validator_1.body)('isTrusted')
        .optional()
        .isBoolean()
        .withMessage('isTrusted must be a boolean value')
        .toBoolean(),
    (0, express_validator_1.body)('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean value')
        .toBoolean(),
    (0, express_validator_1.body)('metadata')
        .optional()
        .isObject()
        .withMessage('Metadata must be an object')
];
exports.validateDeviceIdParam = [
    (0, express_validator_1.param)('deviceId')
        .trim()
        .notEmpty()
        .withMessage('Device ID is required')
        .isLength({ min: 10, max: 255 })
        .withMessage('Device ID must be between 10 and 255 characters')
];
