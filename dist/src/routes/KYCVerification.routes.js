"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const KYCVerification_controller_1 = __importDefault(require("../controllers/KYCVerification.controller"));
const KYCVerification_validator_1 = require("../validators/KYCVerification.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User routes
router.get('/user/:userId', auth_1.authenticate, KYCVerification_controller_1.default.getUserKYCVerifications);
router.get('/status/:userId', auth_1.authenticate, KYCVerification_controller_1.default.checkKYCStatus);
router.post('/', auth_1.authenticate, KYCVerification_validator_1.validateKYCVerification, KYCVerification_controller_1.default.createKYCVerification);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), KYCVerification_controller_1.default.getAllKYCVerifications);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), KYCVerification_controller_1.default.getKYCVerificationById);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), KYCVerification_validator_1.validateKYCUpdate, KYCVerification_controller_1.default.updateKYCVerification);
exports.default = router;
