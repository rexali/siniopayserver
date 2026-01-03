"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFAQReorder = exports.validateFAQ = void 0;
const express_validator_1 = require("express-validator");
exports.validateFAQ = [
    (0, express_validator_1.body)('question')
        .trim()
        .notEmpty()
        .withMessage('Question is required')
        .isLength({ max: 500 })
        .withMessage('Question must not exceed 500 characters'),
    (0, express_validator_1.body)('answer')
        .trim()
        .notEmpty()
        .withMessage('Answer is required')
        .isLength({ max: 5000 })
        .withMessage('Answer must not exceed 5000 characters'),
    (0, express_validator_1.body)('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isLength({ max: 100 })
        .withMessage('Category must not exceed 100 characters'),
    (0, express_validator_1.body)('orderIndex')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Order index must be a non-negative integer'),
    (0, express_validator_1.body)('active')
        .optional()
        .isBoolean()
        .withMessage('Active must be a boolean value')
];
exports.validateFAQReorder = [
    (0, express_validator_1.body)('faqs')
        .isArray({ min: 1 })
        .withMessage('FAQs must be an array with at least one item'),
    (0, express_validator_1.body)('faqs.*.id')
        .isUUID()
        .withMessage('Each FAQ must have a valid ID'),
    (0, express_validator_1.body)('faqs.*.orderIndex')
        .isInt({ min: 0 })
        .withMessage('Order index must be a non-negative integer')
];
