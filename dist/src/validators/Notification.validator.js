"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBulkNotification = exports.validateNotification = void 0;
const express_validator_1 = require("express-validator");
exports.validateNotification = [
    (0, express_validator_1.body)('userId')
        .isUUID()
        .withMessage('Please provide a valid user ID'),
    (0, express_validator_1.body)('type')
        .isIn(['transaction', 'reminder', 'alert', 'system'])
        .withMessage('Invalid notification type'),
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title must not exceed 200 characters'),
    (0, express_validator_1.body)('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ max: 1000 })
        .withMessage('Message must not exceed 1000 characters'),
    (0, express_validator_1.body)('read')
        .optional()
        .isBoolean()
        .withMessage('Read must be a boolean value'),
    (0, express_validator_1.body)('metadata')
        .optional()
        .isObject()
        .withMessage('Metadata must be an object')
];
exports.validateBulkNotification = [
    (0, express_validator_1.body)('notifications')
        .isArray({ min: 1 })
        .withMessage('Notifications must be an array with at least one item'),
    (0, express_validator_1.body)('notifications.*.userId')
        .isUUID()
        .withMessage('Each notification must have a valid user ID'),
    (0, express_validator_1.body)('notifications.*.type')
        .isIn(['transaction', 'reminder', 'alert', 'system'])
        .withMessage('Invalid notification type'),
    (0, express_validator_1.body)('notifications.*.title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title must not exceed 200 characters'),
    (0, express_validator_1.body)('notifications.*.message')
        .trim()
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ max: 1000 })
        .withMessage('Message must not exceed 1000 characters')
];
