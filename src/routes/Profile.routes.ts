import { Router } from 'express';
import ProfileController from '../controllers/Profile.controller';
import { validateProfile, validateProfileUpdate } from '../validators/Profile.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/my-profile/:userId', authenticate, ProfileController.getMyProfile);
router.patch('/update/:id', authenticate, validateProfileUpdate, ProfileController.updateProfile);

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), ProfileController.getAllProfiles);
router.get('/:id', authenticate, authorize(['admin', 'super_admin']), ProfileController.getProfileById);
router.post('/', authenticate, authorize(['admin', 'super_admin']), validateProfile, ProfileController.createProfile);
router.patch('/:id', authenticate, authorize(['admin', 'super_admin']), validateProfile, ProfileController.updateProfile);
router.delete('/:id', authenticate, authorize(['super_admin']), ProfileController.deleteProfile);

export default router;