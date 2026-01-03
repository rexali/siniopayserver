"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notification_controller_1 = __importDefault(require("../controllers/Notification.controller"));
const Notification_validator_1 = require("../validators/Notification.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User routes
router.get('/user/:userId', auth_1.authenticate, Notification_controller_1.default.getUserNotifications);
router.put('/user/:userId/read-all', auth_1.authenticate, Notification_controller_1.default.markAllAsRead);
router.get('/:id', auth_1.authenticate, Notification_controller_1.default.getNotificationById);
router.put('/:id', auth_1.authenticate, Notification_controller_1.default.updateNotification);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Notification_controller_1.default.getAllNotifications);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Notification_validator_1.validateNotification, Notification_controller_1.default.createNotification);
router.post('/bulk', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Notification_validator_1.validateBulkNotification, Notification_controller_1.default.bulkCreateNotifications);
exports.default = router;
