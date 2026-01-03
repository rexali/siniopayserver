"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ComplianceSetting_controller_1 = __importDefault(require("../controllers/ComplianceSetting.controller"));
const ComplianceSetting_validator_1 = require("../validators/ComplianceSetting.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), ComplianceSetting_controller_1.default.getAllComplianceSettings);
router.get('/type/:type', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), ComplianceSetting_controller_1.default.getSettingsByType);
router.get('/key/:key', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), ComplianceSetting_controller_1.default.getComplianceSettingByKey);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), ComplianceSetting_controller_1.default.getComplianceSettingById);
// Super admin only routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['super_admin']), ComplianceSetting_validator_1.validateComplianceSetting, ComplianceSetting_controller_1.default.createComplianceSetting);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['super_admin']), ComplianceSetting_validator_1.validateComplianceSetting, ComplianceSetting_controller_1.default.updateComplianceSetting);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['super_admin']), ComplianceSetting_controller_1.default.deleteComplianceSetting);
router.post('/bulk', auth_1.authenticate, (0, auth_1.authorize)(['super_admin']), ComplianceSetting_validator_1.validateBulkUpdate, ComplianceSetting_controller_1.default.bulkUpdateSettings);
// Compliance check routes
router.post('/check-transaction-limit', auth_1.authenticate, ComplianceSetting_controller_1.default.checkTransactionLimit);
router.post('/check-aml-compliance', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), ComplianceSetting_controller_1.default.checkAMLCompliance);
exports.default = router;
