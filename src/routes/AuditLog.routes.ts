import { Router } from 'express';
import AuditLogController from '../controllers/AuditLog.controller';
import { validateAuditLog } from '../validators/AuditLog.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin routes (all require admin access)
router.get('/', authenticate, authorize(['admin', 'super_admin']), AuditLogController.getAllAuditLogs);
router.get('/stats', authenticate, authorize(['admin', 'super_admin']), AuditLogController.getAuditStatistics);
router.get('/admin/:adminId', authenticate, authorize(['admin', 'super_admin']), AuditLogController.getAuditLogsByAdmin);
router.get('/resource/:resourceType/:resourceId', authenticate, authorize(['admin', 'super_admin']), AuditLogController.getAuditLogsByResource);
router.get('/:id', authenticate, authorize(['admin', 'super_admin']), AuditLogController.getAuditLogById);
router.post('/', authenticate, authorize(['admin', 'super_admin']), validateAuditLog, AuditLogController.createAuditLog);

export default router;