"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSupportTicketReplyUpdate = exports.validateSupportTicketReply = void 0;
const express_validator_1 = require("express-validator");
exports.validateSupportTicketReply = [
    (0, express_validator_1.body)('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ min: 1, max: 5000 })
        .withMessage('Message must be between 1 and 5000 characters')
        .escape(), // Sanitize HTML
    (0, express_validator_1.body)('attachments')
        .optional()
        .isArray()
        .withMessage('Attachments must be an array')
        .custom((attachments) => {
        if (attachments.length > 5) {
            throw new Error('Cannot have more than 5 attachments');
        }
        attachments.forEach((attachment, index) => {
            if (!attachment.name || typeof attachment.name !== 'string') {
                throw new Error(`Attachment at index ${index} must have a valid name`);
            }
            if (!attachment.url || typeof attachment.url !== 'string') {
                throw new Error(`Attachment at index ${index} must have a valid URL`);
            }
            // Validate URL format
            try {
                new URL(attachment.url);
            }
            catch {
                throw new Error(`Attachment at index ${index} must have a valid URL`);
            }
            // Validate file type (optional)
            const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.doc', '.docx'];
            const hasValidExtension = validExtensions.some(ext => attachment.url.toLowerCase().endsWith(ext));
            if (!hasValidExtension) {
                throw new Error(`Attachment at index ${index} has an invalid file type. ` +
                    `Allowed types: ${validExtensions.join(', ')}`);
            }
        });
        return true;
    }),
    (0, express_validator_1.body)('isInternalNote')
        .optional()
        .isBoolean()
        .withMessage('isInternalNote must be a boolean value')
        .toBoolean()
];
exports.validateSupportTicketReplyUpdate = [
    (0, express_validator_1.body)('message')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Message cannot be empty if provided')
        .isLength({ min: 1, max: 5000 })
        .withMessage('Message must be between 1 and 5000 characters')
        .escape(),
    (0, express_validator_1.body)('attachments')
        .optional()
        .isArray()
        .withMessage('Attachments must be an array')
        .custom((attachments) => {
        if (attachments.length > 5) {
            throw new Error('Cannot have more than 5 attachments');
        }
        attachments.forEach((attachment, index) => {
            if (!attachment.name || typeof attachment.name !== 'string') {
                throw new Error(`Attachment at index ${index} must have a valid name`);
            }
            if (!attachment.url || typeof attachment.url !== 'string') {
                throw new Error(`Attachment at index ${index} must have a valid URL`);
            }
            // Validate URL format
            try {
                new URL(attachment.url);
            }
            catch {
                throw new Error(`Attachment at index ${index} must have a valid URL`);
            }
        });
        return true;
    }),
    (0, express_validator_1.body)('isInternalNote')
        .optional()
        .isBoolean()
        .withMessage('isInternalNote must be a boolean value')
        .toBoolean()
];
