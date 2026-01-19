"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SupportTicketReply_model_1 = __importDefault(require("../models/SupportTicketReply.model"));
const SupportTicket_model_1 = __importDefault(require("../models/SupportTicket.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const express_validator_1 = require("express-validator");
const sequelize_1 = require("sequelize");
const AuditLog_model_1 = __importDefault(require("../models/AuditLog.model"));
class SupportTicketReplyController {
    // Get all replies for a ticket
    async getTicketReplies(req, res) {
        try {
            const { ticketId } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;
            const { page = 1, limit = 50, includeInternal = 'false' } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            // Check if ticket exists
            const ticket = await SupportTicket_model_1.default.findByPk(ticketId);
            if (!ticket) {
                return res.status(404).json({ error: 'Support ticket not found' });
            }
            // Check permissions
            const canView = this.checkViewPermissions(userId, userRole, ticket);
            if (!canView) {
                return res.status(403).json({
                    error: 'You do not have permission to view replies for this ticket'
                });
            }
            // Build where clause
            const where = { ticketId };
            // Filter internal notes based on permissions
            if (includeInternal !== 'true' && userRole !== 'admin' && userRole !== 'super_admin') {
                where.isInternalNote = false;
            }
            const { rows: replies, count: total } = await SupportTicketReply_model_1.default.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email', 'fullName', 'role'],
                        include: [{
                                model: require('../models/Profile.model').default,
                                as: 'profile',
                                attributes: ['avatarUrl']
                            }]
                    }
                ],
                order: [['createdAt', 'ASC']] // Oldest first for conversation view
            });
            // Mark internal notes for non-admins
            const processedReplies = replies.map(reply => {
                const replyData = reply.toJSON();
                if (userRole !== 'admin' && userRole !== 'super_admin' && replyData.isInternalNote) {
                    replyData.message = '[Internal Note - Hidden from customer view]';
                    replyData.attachments = [];
                }
                return replyData;
            });
            res.json({
                success: true,
                data: processedReplies,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            });
        }
        catch (error) {
            console.error('Error getting ticket replies:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get single reply by ID
    async getReplyById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;
            const reply = await SupportTicketReply_model_1.default.findByPk(id, {
                include: [
                    {
                        model: SupportTicket_model_1.default,
                        as: 'ticket'
                    },
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email', 'fullName', 'role']
                    }
                ]
            });
            if (!reply) {
                return res.status(404).json({ error: 'Reply not found' });
            }
            // Check permissions
            const canView = this.checkViewPermissions(userId, userRole, reply.ticket);
            if (!canView) {
                return res.status(403).json({
                    error: 'You do not have permission to view this reply'
                });
            }
            // Handle internal notes for non-admins
            const replyData = reply.toJSON();
            if (userRole !== 'admin' && userRole !== 'super_admin' && replyData.isInternalNote) {
                replyData.message = '[Internal Note - Hidden from customer view]';
                replyData.attachments = [];
            }
            res.json({
                success: true,
                data: replyData
            });
        }
        catch (error) {
            console.error('Error getting reply by ID:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Create a new reply
    async createReply(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { ticketId } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;
            const { message, attachments = [], isInternalNote = false } = req.body;
            // Check if ticket exists
            const ticket = await SupportTicket_model_1.default.findByPk(ticketId);
            if (!ticket) {
                return res.status(404).json({ error: 'Support ticket not found' });
            }
            // Check if ticket is closed
            if (ticket.status === 'closed') {
                return res.status(400).json({ error: 'Cannot reply to a closed ticket' });
            }
            // Check permissions for internal notes
            if (isInternalNote && userRole !== 'admin' && userRole !== 'super_admin') {
                return res.status(403).json({
                    error: 'Only admins can create internal notes'
                });
            }
            // Check if user can reply to this ticket
            const canReply = this.checkReplyPermissions(userId, userRole, ticket);
            if (!canReply) {
                return res.status(403).json({
                    error: 'You do not have permission to reply to this ticket'
                });
            }
            // Create the reply
            const reply = await SupportTicketReply_model_1.default.create({
                ticketId,
                userId,
                message,
                attachments,
                isInternalNote
            });
            // Update ticket status if needed
            let statusUpdate = {};
            if (userRole === 'customer' && ticket.status === 'resolved') {
                // Customer reply re-opens a resolved ticket
                statusUpdate = { status: 'in_progress' };
            }
            else if ((userRole === 'admin' || userRole === 'super_admin') && ticket.status === 'open') {
                // Admin reply moves open ticket to in_progress
                statusUpdate = { status: 'in_progress' };
            }
            if (Object.keys(statusUpdate).length > 0) {
                await ticket.update(statusUpdate);
            }
            // Log the action
            await AuditLog_model_1.default.create({
                userId: userId,
                action: 'CREATE_TICKET_REPLY',
                resourceType: 'support_ticket_reply',
                resourceId: reply.id,
                details: {
                    ticketId,
                    isInternalNote,
                    messageLength: message.length,
                    attachmentCount: attachments.length
                }
            });
            // Fetch the reply with user data
            const replyWithUser = await SupportTicketReply_model_1.default.findByPk(reply.id, {
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email', 'fullName', 'role']
                    }
                ]
            });
            res.status(201).json({
                success: true,
                message: 'Reply created successfully',
                data: replyWithUser
            });
        }
        catch (error) {
            console.error('Error creating reply:', error);
            res.status(500).json({
                error: 'Failed to create reply',
                details: error.message
            });
        }
    }
    // Update a reply
    async updateReply(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;
            const { message, attachments, isInternalNote } = req.body;
            // Find the reply
            const reply = await SupportTicketReply_model_1.default.findByPk(id, {
                include: [
                    {
                        model: SupportTicket_model_1.default,
                        as: 'ticket'
                    }
                ]
            });
            if (!reply) {
                return res.status(404).json({ error: 'Reply not found' });
            }
            // Check permissions
            const canUpdate = this.checkUpdatePermissions(userId, userRole, reply);
            if (!canUpdate) {
                return res.status(403).json({
                    error: 'You do not have permission to update this reply'
                });
            }
            // Check if internal note status is being changed
            if (isInternalNote !== undefined && isInternalNote !== reply.isInternalNote) {
                if (userRole !== 'admin' && userRole !== 'super_admin') {
                    return res.status(403).json({
                        error: 'Only admins can change internal note status'
                    });
                }
            }
            // Update the reply
            const updateData = {};
            if (message !== undefined)
                updateData.message = message;
            if (attachments !== undefined)
                updateData.attachments = attachments;
            if (isInternalNote !== undefined)
                updateData.isInternalNote = isInternalNote;
            const previousData = reply.toJSON();
            await reply.update(updateData);
            // Log the action
            await AuditLog_model_1.default.create({
                userId: userId,
                action: 'UPDATE_TICKET_REPLY',
                resourceType: 'support_ticket_reply',
                resourceId: reply.id,
                details: {
                    previousData,
                    newData: reply.toJSON(),
                    updatedBy: userId
                }
            });
            res.json({
                success: true,
                message: 'Reply updated successfully',
                data: reply
            });
        }
        catch (error) {
            console.error('Error updating reply:', error);
            res.status(500).json({
                error: 'Failed to update reply',
                details: error.message
            });
        }
    }
    // Delete a reply
    async deleteReply(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;
            // Find the reply
            const reply = await SupportTicketReply_model_1.default.findByPk(id);
            if (!reply) {
                return res.status(404).json({ error: 'Reply not found' });
            }
            // Check permissions
            const canDelete = this.checkDeletePermissions(userId, userRole, reply);
            if (!canDelete) {
                return res.status(403).json({
                    error: 'You do not have permission to delete this reply'
                });
            }
            // Log the action
            await AuditLog_model_1.default.create({
                userId: userId,
                action: 'DELETE_TICKET_REPLY',
                resourceType: 'support_ticket_reply',
                resourceId: reply.id,
                details: {
                    ticketId: reply.ticketId,
                    userId: reply.userId,
                    messagePreview: reply.message.substring(0, 100)
                }
            });
            // Delete the reply
            await reply.destroy();
            res.json({
                success: true,
                message: 'Reply deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting reply:', error);
            res.status(500).json({
                error: 'Failed to delete reply',
                details: error.message
            });
        }
    }
    // Get reply statistics for a ticket
    async getReplyStatistics(req, res) {
        try {
            const { ticketId } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;
            // Check if ticket exists
            const ticket = await SupportTicket_model_1.default.findByPk(ticketId);
            if (!ticket) {
                return res.status(404).json({ error: 'Support ticket not found' });
            }
            // Check permissions
            const canView = this.checkViewPermissions(userId, userRole, ticket);
            if (!canView) {
                return res.status(403).json({
                    error: 'You do not have permission to view statistics for this ticket'
                });
            }
            const statistics = await SupportTicketReply_model_1.default.findAll({
                where: { ticketId },
                attributes: [
                    'isInternalNote',
                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count'],
                    [
                        (0, sequelize_1.fn)('MIN', (0, sequelize_1.col)('createdAt')),
                        'firstReplyAt'
                    ],
                    [
                        (0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('createdAt')),
                        'lastReplyAt'
                    ]
                ],
                group: ['isInternalNote']
            });
            const userStats = await SupportTicketReply_model_1.default.findAll({
                where: { ticketId },
                attributes: [
                    'userId',
                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'replyCount']
                ],
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email', 'fullName', 'role']
                    }
                ],
                group: ['userId', 'user.id', 'user.email', 'user.fullName', 'user.role'],
                order: [[(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'DESC']]
            });
            const totalReplies = statistics.reduce((total, stat) => total + parseInt(stat.get('count')), 0);
            const internalNoteCount = statistics.find((stat) => stat.get('isInternalNote') === true)?.get('count') || 0;
            const publicReplyCount = totalReplies - internalNoteCount;
            res.json({
                success: true,
                data: {
                    totalReplies,
                    internalNoteCount,
                    publicReplyCount,
                    userStats: userStats.map((stat) => ({
                        user: stat.user,
                        replyCount: stat.get('replyCount')
                    })),
                    timeRange: {
                        firstReplyAt: statistics[0]?.get('firstReplyAt'),
                        lastReplyAt: statistics[0]?.get('lastReplyAt')
                    }
                }
            });
        }
        catch (error) {
            console.error('Error getting reply statistics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Mark reply as read (for notification purposes)
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const reply = await SupportTicketReply_model_1.default.findByPk(id);
            if (!reply) {
                return res.status(404).json({ error: 'Reply not found' });
            }
            // In a real implementation, you would have a separate table for read status
            // For now, we'll just acknowledge the request
            res.json({
                success: true,
                message: 'Reply marked as read'
            });
        }
        catch (error) {
            console.error('Error marking reply as read:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Helper methods for permission checking
    checkViewPermissions(userId, userRole, ticket) {
        // Admins can view everything
        if (userRole === 'admin' || userRole === 'super_admin') {
            return true;
        }
        // Customers can only view their own tickets
        return ticket.userId === userId;
    }
    checkReplyPermissions(userId, userRole, ticket) {
        // Admins can always reply
        if (userRole === 'admin' || userRole === 'super_admin') {
            return true;
        }
        // Customers can only reply to their own tickets
        if (userRole === 'customer') {
            return ticket.userId === userId;
        }
        return false;
    }
    checkUpdatePermissions(userId, userRole, reply) {
        // Admins can update any reply
        if (userRole === 'admin' || userRole === 'super_admin') {
            return true;
        }
        // Users can only update their own replies (within time limit)
        if (reply.userId === userId) {
            const replyAge = Date.now() - new Date(reply.createdAt).getTime();
            const maxEditTime = 30 * 60 * 1000; // 30 minutes in milliseconds
            return replyAge <= maxEditTime;
        }
        return false;
    }
    checkDeletePermissions(userId, userRole, reply) {
        // Only admins can delete replies
        return userRole === 'admin' || userRole === 'super_admin';
    }
}
exports.default = new SupportTicketReplyController();
