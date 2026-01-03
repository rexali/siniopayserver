"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSupportTicket = void 0;
const express_validator_1 = require("express-validator");
exports.validateSupportTicket = [
    (0, express_validator_1.body)('userId')
        .isUUID()
        .withMessage('Please provide a valid user ID'),
    (0, express_validator_1.body)('subject')
        .trim()
        .notEmpty()
        .withMessage('Subject is required')
        .isLength({ max: 200 })
        .withMessage('Subject must not exceed 200 characters'),
    (0, express_validator_1.body)('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ max: 5000 })
        .withMessage('Message must not exceed 5000 characters'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['open', 'in_progress', 'resolved', 'closed'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority'),
    (0, express_validator_1.body)('assignedTo')
        .optional()
        .isUUID()
        .withMessage('Please provide a valid assignee ID')
];
