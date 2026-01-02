import { body } from 'express-validator';

export const validateComplianceSetting = [
  body('settingType')
    .isIn(['transaction_limit', 'aml_rule', 'security_policy'])
    .withMessage('Invalid setting type'),
  
  body('settingKey')
    .trim()
    .notEmpty()
    .withMessage('Setting key is required')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('Setting key must contain only lowercase letters, numbers, and underscores')
    .isLength({ max: 50 })
    .withMessage('Setting key must not exceed 50 characters'),
  
  body('settingValue')
    .notEmpty()
    .withMessage('Setting value is required'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value')
];

export const validateBulkUpdate = [
  body('settings')
    .isArray({ min: 1 })
    .withMessage('Settings must be an array with at least one item'),
  
  body('settings.*.id')
    .isUUID()
    .withMessage('Each setting must have a valid ID'),
  
  body('settings.*.updates')
    .isObject()
    .withMessage('Each setting must have updates object'),
  
  body('settings.*.updates.settingValue')
    .optional()
    .notEmpty()
    .withMessage('Setting value cannot be empty'),
  
  body('settings.*.updates.active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value')
];