import { Router } from 'express';
import KYCVerificationController from '../controllers/KYCVerification.controller';
import { 
  validateKYCVerification, 
  validateKYCUpdate 
} from '../validators/KYCVerification.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// User routes
router.get('/user/:userId', authenticate, KYCVerificationController.getUserKYCVerifications);
router.get('/status/:userId', authenticate, KYCVerificationController.checkKYCStatus);
router.post('/', authenticate, validateKYCVerification, KYCVerificationController.createKYCVerification);

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), KYCVerificationController.getAllKYCVerifications);
router.get('/:id', authenticate, authorize(['admin', 'super_admin']), KYCVerificationController.getKYCVerificationById);
router.put('/:id', authenticate, authorize(['admin', 'super_admin']), validateKYCUpdate, KYCVerificationController.updateKYCVerification);

export default router;