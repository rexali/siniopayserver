import { body, param } from 'express-validator';

export const validateDeviceRegistration = [
  body('deviceId')
    .trim()
    .notEmpty()
    .withMessage('Device ID is required')
    .isLength({ min: 10, max: 255 })
    .withMessage('Device ID must be between 10 and 255 characters')
    .escape(),

  body('deviceName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Device name must not exceed 100 characters')
    .escape(),

  body('deviceType')
    .optional()
    .isIn(['desktop', 'mobile', 'tablet', 'smart_tv', 'wearable', 'unknown'])
    .withMessage('Invalid device type'),

  body('userAgent')
    .trim()
    .notEmpty()
    .withMessage('User agent is required')
    .isLength({ max: 500 })
    .withMessage('User agent must not exceed 500 characters'),

  body('fingerprint')
    .optional()
    .isLength({ max: 64 })
    .withMessage('Fingerprint must not exceed 64 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Fingerprint contains invalid characters'),

  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

export const validateDeviceUpdate = [
  param('id')
    .isUUID()
    .withMessage('Invalid device ID'),

  body('deviceName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Device name must not exceed 100 characters')
    .escape(),

  body('isTrusted')
    .optional()
    .isBoolean()
    .withMessage('isTrusted must be a boolean value')
    .toBoolean(),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
    .toBoolean(),

  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

export const validateDeviceIdParam = [
  param('deviceId')
    .trim()
    .notEmpty()
    .withMessage('Device ID is required')
    .isLength({ min: 10, max: 255 })
    .withMessage('Device ID must be between 10 and 255 characters')
];