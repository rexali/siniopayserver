import { body } from 'express-validator';

export const validateSupportTicket = [
  body('userId')
    .isUUID()
    .withMessage('Please provide a valid user ID'),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject must not exceed 200 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 5000 })
    .withMessage('Message must not exceed 5000 characters'),
  
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  
  body('assignedTo')
    .optional()
    .isUUID()
    .withMessage('Please provide a valid assignee ID')
];