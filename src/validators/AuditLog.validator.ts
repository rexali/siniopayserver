import { body } from 'express-validator';

export const validateAuditLog = [
  body('adminId')
    .isUUID()
    .withMessage('Please provide a valid admin ID'),
  
  body('action')
    .trim()
    .notEmpty()
    .withMessage('Action is required')
    .isLength({ max: 100 })
    .withMessage('Action must not exceed 100 characters'),
  
  body('resourceType')
    .trim()
    .notEmpty()
    .withMessage('Resource type is required')
    .isLength({ max: 50 })
    .withMessage('Resource type must not exceed 50 characters'),
  
  body('resourceId')
    .optional()
    .isUUID()
    .withMessage('Please provide a valid resource ID'),
  
  body('details')
    .optional()
    .isObject()
    .withMessage('Details must be an object')
];