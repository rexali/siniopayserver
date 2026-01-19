"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserDevice_controller_1 = __importDefault(require("../controllers/UserDevice.controller"));
const UserDevice_validator_1 = require("../validators/UserDevice.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Get current user's devices
router.get('/my-devices', UserDevice_controller_1.default.getMyDevices);
// Get device statistics
router.get('/statistics', UserDevice_controller_1.default.getDeviceStatistics);
// Register new device
router.post('/register', UserDevice_validator_1.validateDeviceRegistration, UserDevice_controller_1.default.registerDevice);
// Check device trust status
router.get('/check-trust/:deviceId', UserDevice_controller_1.default.checkDeviceTrust);
// Update device activity (heartbeat)
router.put('/activity/:deviceId', UserDevice_controller_1.default.updateDeviceActivity);
// Revoke all other devices
router.post('/revoke-others', UserDevice_controller_1.default.revokeOtherDevices);
// Device CRUD operations
router.get('/:id', UserDevice_controller_1.default.getDeviceById);
router.put('/:id', UserDevice_validator_1.validateDeviceUpdate, UserDevice_controller_1.default.updateDevice);
router.delete('/:id', UserDevice_controller_1.default.deleteDevice);
// Admin routes for suspicious devices
router.get('/admin/suspicious', (0, auth_1.authorize)(['admin', 'super_admin']), UserDevice_controller_1.default.getSuspiciousDevices);
exports.default = router;
