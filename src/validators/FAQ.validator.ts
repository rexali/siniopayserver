import { body } from 'express-validator';

export const validateFAQ = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ max: 500 })
    .withMessage('Question must not exceed 500 characters'),
  
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ max: 5000 })
    .withMessage('Answer must not exceed 5000 characters'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  
  body('orderIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order index must be a non-negative integer'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value')
];

export const validateFAQReorder = [
  body('faqs')
    .isArray({ min: 1 })
    .withMessage('FAQs must be an array with at least one item'),
  
  body('faqs.*.id')
    .isUUID()
    .withMessage('Each FAQ must have a valid ID'),
  
  body('faqs.*.orderIndex')
    .isInt({ min: 0 })
    .withMessage('Order index must be a non-negative integer')
];