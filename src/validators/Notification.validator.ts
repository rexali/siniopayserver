import { body } from 'express-validator';

export const validateNotification = [
  body('userId')
    .isUUID()
    .withMessage('Please provide a valid user ID'),
  
  body('type')
    .isIn(['transaction', 'reminder', 'alert', 'system'])
    .withMessage('Invalid notification type'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must not exceed 1000 characters'),
  
  body('read')
    .optional()
    .isBoolean()
    .withMessage('Read must be a boolean value'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

export const validateBulkNotification = [
  body('notifications')
    .isArray({ min: 1 })
    .withMessage('Notifications must be an array with at least one item'),
  
  body('notifications.*.userId')
    .isUUID()
    .withMessage('Each notification must have a valid user ID'),
  
  body('notifications.*.type')
    .isIn(['transaction', 'reminder', 'alert', 'system'])
    .withMessage('Invalid notification type'),
  
  body('notifications.*.title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  
  body('notifications.*.message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must not exceed 1000 characters')
];