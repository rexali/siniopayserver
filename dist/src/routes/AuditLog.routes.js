"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditLog_controller_1 = __importDefault(require("../controllers/AuditLog.controller"));
const AuditLog_validator_1 = require("../validators/AuditLog.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Admin routes (all require admin access)
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), AuditLog_controller_1.default.getAllAuditLogs);
router.get('/stats', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), AuditLog_controller_1.default.getAuditStatistics);
router.get('/admin/:adminId', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), AuditLog_controller_1.default.getAuditLogsByAdmin);
router.get('/resource/:resourceType/:resourceId', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), AuditLog_controller_1.default.getAuditLogsByResource);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), AuditLog_controller_1.default.getAuditLogById);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), AuditLog_validator_1.validateAuditLog, AuditLog_controller_1.default.createAuditLog);
exports.default = router;
