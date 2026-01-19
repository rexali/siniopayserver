import { Router } from 'express';
import SupportTicketReplyController from '../controllers/SupportTicketReply.controller';
import { 
  validateSupportTicketReply,
  validateSupportTicketReplyUpdate
} from '../validators/SupportTicketReply.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all replies for a ticket
router.get('/ticket/:ticketId', SupportTicketReplyController.getTicketReplies);

// Get reply statistics for a ticket
router.get('/ticket/:ticketId/statistics', SupportTicketReplyController.getReplyStatistics);

// Get single reply
router.get('/:id', SupportTicketReplyController.getReplyById);

// Create new reply
router.post(
  '/ticket/:ticketId', 
  validateSupportTicketReply, 
  SupportTicketReplyController.createReply
);

// Update reply
router.put(
  '/:id', 
  validateSupportTicketReplyUpdate, 
  SupportTicketReplyController.updateReply
);

// Delete reply (admin only)
router.delete(
  '/:id', 
  authorize(['admin', 'super_admin']), 
  SupportTicketReplyController.deleteReply
);

// Mark reply as read
router.post('/:id/read', SupportTicketReplyController.markAsRead);

export default router;