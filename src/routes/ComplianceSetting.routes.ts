import { Router } from 'express';
import ComplianceSettingController from '../controllers/ComplianceSetting.controller';
import { 
  validateComplianceSetting,
  validateBulkUpdate 
} from '../validators/ComplianceSetting.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), ComplianceSettingController.getAllComplianceSettings);
router.get('/type/:type', authenticate, authorize(['admin', 'super_admin']), ComplianceSettingController.getSettingsByType);
router.get('/key/:key', authenticate, authorize(['admin', 'super_admin']), ComplianceSettingController.getComplianceSettingByKey);
router.get('/:id', authenticate, authorize(['admin', 'super_admin']), ComplianceSettingController.getComplianceSettingById);

// Super admin only routes
router.post('/', authenticate, authorize(['super_admin']), validateComplianceSetting, ComplianceSettingController.createComplianceSetting);
router.put('/:id', authenticate, authorize(['super_admin']), validateComplianceSetting, ComplianceSettingController.updateComplianceSetting);
router.delete('/:id', authenticate, authorize(['super_admin']), ComplianceSettingController.deleteComplianceSetting);
router.post('/bulk', authenticate, authorize(['super_admin']), validateBulkUpdate, ComplianceSettingController.bulkUpdateSettings);

// Compliance check routes
router.post('/check-transaction-limit', authenticate, ComplianceSettingController.checkTransactionLimit);
router.post('/check-aml-compliance', authenticate, authorize(['admin', 'super_admin']), ComplianceSettingController.checkAMLCompliance);

export default router;