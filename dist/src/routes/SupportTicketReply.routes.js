"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SupportTicketReply_controller_1 = __importDefault(require("../controllers/SupportTicketReply.controller"));
const SupportTicketReply_validator_1 = require("../validators/SupportTicketReply.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Get all replies for a ticket
router.get('/ticket/:ticketId', SupportTicketReply_controller_1.default.getTicketReplies);
// Get reply statistics for a ticket
router.get('/ticket/:ticketId/statistics', SupportTicketReply_controller_1.default.getReplyStatistics);
// Get single reply
router.get('/:id', SupportTicketReply_controller_1.default.getReplyById);
// Create new reply
router.post('/ticket/:ticketId', SupportTicketReply_validator_1.validateSupportTicketReply, SupportTicketReply_controller_1.default.createReply);
// Update reply
router.put('/:id', SupportTicketReply_validator_1.validateSupportTicketReplyUpdate, SupportTicketReply_controller_1.default.updateReply);
// Delete reply (admin only)
router.delete('/:id', (0, auth_1.authorize)(['admin', 'super_admin']), SupportTicketReply_controller_1.default.deleteReply);
// Mark reply as read
router.post('/:id/read', SupportTicketReply_controller_1.default.markAsRead);
exports.default = router;
