"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_controller_1 = __importDefault(require("../controllers/User.controller"));
const User_validator_1 = require("../validators/User.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', User_validator_1.validateRegistration, User_controller_1.default.register);
router.post('/login', User_validator_1.validateLogin, User_controller_1.default.login);
router.post('/remember-this-device', User_controller_1.default.login);
router.post('/verify-user', User_validator_1.validateTokenVerification, User_controller_1.default.verifyUserToken);
router.post('/verify-email', User_validator_1.validateEmailVerification, User_controller_1.default.verifyEmail);
router.post('/resend-verification-email', User_validator_1.validateEmailVerification, User_controller_1.default.resendVerificationEmail);
router.post('/verify-verification-code', User_validator_1.validateVerificationCode, User_controller_1.default.verifyVerificationCode);
router.post('/send-verification-code', User_validator_1.validateVerificationCode, User_controller_1.default.sendVerificationCode);
router.post('/forgot-password', User_validator_1.validateForgotPassword, User_controller_1.default.forgotPassword);
router.post('/reset-password', User_validator_1.validateResetPassword, User_controller_1.default.resetPassword);
// Authenticated user routes
router.get('/me', auth_1.authenticate, User_controller_1.default.getCurrentUser);
router.put('/me', auth_1.authenticate, User_validator_1.validateUserUpdate, User_controller_1.default.updateCurrentUser);
router.put('/me/toggle-2fa', auth_1.authenticate, User_controller_1.default.toggleTwoFactorAuthentication);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), User_controller_1.default.getAllUsers);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), User_controller_1.default.getUserById);
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), User_validator_1.validateAdminUserUpdate, User_controller_1.default.updateUser);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['super_admin']), User_controller_1.default.deleteUser);
exports.default = router;
