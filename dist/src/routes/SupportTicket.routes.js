"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SupportTicket_controller_1 = __importDefault(require("../controllers/SupportTicket.controller"));
const SupportTicket_validator_1 = require("../validators/SupportTicket.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User routes
router.get('/user/:userId', auth_1.authenticate, SupportTicket_controller_1.default.getUserSupportTickets);
router.post('/', auth_1.authenticate, SupportTicket_validator_1.validateSupportTicket, SupportTicket_controller_1.default.createSupportTicket);
router.get('/:id', auth_1.authenticate, SupportTicket_controller_1.default.getSupportTicketById);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), SupportTicket_controller_1.default.getAllSupportTickets);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), SupportTicket_validator_1.validateSupportTicket, SupportTicket_controller_1.default.updateSupportTicket);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['super_admin']), SupportTicket_controller_1.default.deleteSupportTicket);
router.get('/assigned/:adminId', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), SupportTicket_controller_1.default.getAssignedTickets);
router.get('/stats', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), SupportTicket_controller_1.default.getTicketStatistics);
exports.default = router;
