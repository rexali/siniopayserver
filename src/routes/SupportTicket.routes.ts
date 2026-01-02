import { Router } from 'express';
import SupportTicketController from '../controllers/SupportTicket.controller';
import { validateSupportTicket } from '../validators/SupportTicket.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// User routes
router.get('/user/:userId', authenticate, SupportTicketController.getUserSupportTickets);
router.post('/', authenticate, validateSupportTicket, SupportTicketController.createSupportTicket);
router.get('/:id', authenticate, SupportTicketController.getSupportTicketById);

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), SupportTicketController.getAllSupportTickets);
router.put('/:id', authenticate, authorize(['admin', 'super_admin']), validateSupportTicket, SupportTicketController.updateSupportTicket);
router.delete('/:id', authenticate, authorize(['super_admin']), SupportTicketController.deleteSupportTicket);
router.get('/assigned/:adminId', authenticate, authorize(['admin', 'super_admin']), SupportTicketController.getAssignedTickets);
router.get('/stats', authenticate, authorize(['admin', 'super_admin']), SupportTicketController.getTicketStatistics);

export default router;