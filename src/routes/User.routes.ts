import { Router } from 'express';
import UserController from '../controllers/User.controller';
import { 
  validateRegistration,
  validateLogin,
  validateEmailVerification,
  validateForgotPassword,
  validateResetPassword,
  validateUserUpdate,
  validateAdminUserUpdate,
  validateTokenVerification,
  validateVerificationCode
} from '../validators/User.validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateRegistration, UserController.register);
router.post('/login', validateLogin, UserController.login);
router.post('/remember-this-device', UserController.login);
router.post('/verify-user', validateTokenVerification, UserController.verifyUserToken);
router.post('/verify-email', validateEmailVerification, UserController.verifyEmail);
router.post('/resend-verification-email', validateEmailVerification, UserController.resendVerificationEmail);
router.post('/verify-verification-code', validateVerificationCode, UserController.verifyVerificationCode);
router.post('/send-verification-code', validateVerificationCode, UserController.sendVerificationCode);
router.post('/forgot-password', validateForgotPassword, UserController.forgotPassword);
router.post('/reset-password', validateResetPassword, UserController.resetPassword);

// Authenticated user routes
router.get('/me', authenticate, UserController.getCurrentUser);
router.put('/me', authenticate, validateUserUpdate, UserController.updateCurrentUser);
router.put('/me/toggle-2fa', authenticate, UserController.toggleTwoFactorAuthentication);

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), UserController.getAllUsers);
router.get('/:id', authenticate, authorize(['admin', 'super_admin']), UserController.getUserById);
router.patch('/:id', authenticate, authorize(['admin', 'super_admin']), validateAdminUserUpdate, UserController.updateUser);
router.delete('/:id', authenticate, authorize(['super_admin']), UserController.deleteUser);

export default router;