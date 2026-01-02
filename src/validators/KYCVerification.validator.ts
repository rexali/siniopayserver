import { body } from 'express-validator';

export const validateKYCVerification = [
  body('userId')
    .isUUID()
    .withMessage('Please provide a valid user ID'),
  
  body('verificationType')
    .isIn(['identity', 'address', 'document'])
    .withMessage('Invalid verification type'),
  
  body('documents')
    .optional()
    .isArray()
    .withMessage('Documents must be an array'),
  
  body('documents.*.type')
    .if(body('documents').exists())
    .notEmpty()
    .withMessage('Document type is required'),
  
  body('documents.*.url')
    .if(body('documents').exists())
    .isURL()
    .withMessage('Document URL must be valid'),
  
  body('documents.*.number')
    .if(body('documents').exists())
    .notEmpty()
    .withMessage('Document number is required')
];

export const validateKYCUpdate = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'under_review'])
    .withMessage('Invalid status'),
  
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Rejection reason must not exceed 1000 characters'),
  
  body('verifiedBy')
    .optional()
    .isUUID()
    .withMessage('Please provide a valid verifier ID')
];