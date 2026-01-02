
import { Router } from 'express';
import NotificationController from '../controllers/Notification.controller';
import { 
  validateNotification, 
  validateBulkNotification 
} from '../validators/Notification.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// User routes
router.get('/user/:userId', authenticate, NotificationController.getUserNotifications);
router.put('/user/:userId/read-all', authenticate, NotificationController.markAllAsRead);
router.get('/:id', authenticate, NotificationController.getNotificationById);
router.put('/:id', authenticate, NotificationController.updateNotification);

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), NotificationController.getAllNotifications);
router.post('/', authenticate, authorize(['admin', 'super_admin']), validateNotification, NotificationController.createNotification);
router.post('/bulk', authenticate, authorize(['admin', 'super_admin']), validateBulkNotification, NotificationController.bulkCreateNotifications);

export default router;
