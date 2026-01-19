import { Router } from 'express';
import UserDeviceController from '../controllers/UserDevice.controller';
import { 
  validateDeviceRegistration,
  validateDeviceUpdate
} from '../validators/UserDevice.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user's devices
router.get('/my-devices', UserDeviceController.getMyDevices);

// Get device statistics
router.get('/statistics', UserDeviceController.getDeviceStatistics);

// Register new device
router.post('/register', validateDeviceRegistration, UserDeviceController.registerDevice);

// Check device trust status
router.get('/check-trust/:deviceId', UserDeviceController.checkDeviceTrust);

// Update device activity (heartbeat)
router.put('/activity/:deviceId', UserDeviceController.updateDeviceActivity);

// Revoke all other devices
router.post('/revoke-others', UserDeviceController.revokeOtherDevices);

// Device CRUD operations
router.get('/:id', UserDeviceController.getDeviceById);
router.put('/:id', validateDeviceUpdate, UserDeviceController.updateDevice);
router.delete('/:id', UserDeviceController.deleteDevice);

// Admin routes for suspicious devices
router.get(
  '/admin/suspicious', 
  authorize(['admin', 'super_admin']), 
  UserDeviceController.getSuspiciousDevices
);

export default router;