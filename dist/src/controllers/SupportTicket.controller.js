"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SupportTicket_model_1 = __importDefault(require("../models/SupportTicket.model"));
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const Notification_model_1 = __importDefault(require("../models/Notification.model"));
const express_validator_1 = require("express-validator");
const sequelize_1 = require("sequelize");
const User_model_1 = __importDefault(require("../models/User.model"));
class SupportTicketController {
    // Get all support tickets (admin only)
    async getAllSupportTickets(req, res) {
        try {
            const { page = 1, limit = 50, status, priority, assignedTo } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            if (status)
                where.status = status;
            if (priority)
                where.priority = priority;
            if (assignedTo)
                where.assignedTo = assignedTo;
            const supportTickets = await SupportTicket_model_1.default.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email'],
                        include: [{
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }]
                    },
                    {
                        model: User_model_1.default,
                        as: 'assignee',
                        attributes: ['id', 'email'],
                        include: [{
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }]
                    }
                ],
                order: [
                    ['priority', 'DESC'],
                    ['createdAt', 'DESC']
                ]
            });
            res.json({
                total: supportTickets.count,
                page: parseInt(page),
                totalPages: Math.ceil(supportTickets.count / parseInt(limit)),
                tickets: supportTickets.rows
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get support ticket by ID
    async getSupportTicketById(req, res) {
        try {
            const supportTicket = await SupportTicket_model_1.default.findByPk(req.params.id, {
                include: [
                    {
                        model: User_model_1.default, as: 'user',
                        attributes: ['id', 'email'],
                        include: [{
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName', 'phone']
                            }]
                    },
                    {
                        model: User_model_1.default,
                        as: 'assignee',
                        attributes: ['id', 'email'],
                        include: [{
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }]
                    }
                ]
            });
            if (!supportTicket) {
                return res.status(404).json({ error: 'Support ticket not found' });
            }
            res.json(supportTicket);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Create support ticket
    async createSupportTicket(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            // Check if user exists
            const user = await User_model_1.default.findByPk(req.body.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const supportTicket = await SupportTicket_model_1.default.create(req.body);
            // Create notification for admins
            await this.notifyAdminsAboutNewTicket(supportTicket);
            res.status(201).json(supportTicket);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create support ticket' });
        }
    }
    // Update support ticket
    async updateSupportTicket(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const supportTicket = await SupportTicket_model_1.default.findByPk(req.params.id);
            if (!supportTicket) {
                return res.status(404).json({ error: 'Support ticket not found' });
            }
            // Check if assignedTo is a valid admin
            if (req.body.assignedTo) {
                const assignee = await User_model_1.default.findByPk(req.body.assignedTo);
                if (!assignee || !['admin', 'super_admin'].includes(assignee.role)) {
                    return res.status(400).json({ error: 'Assignee must be an admin' });
                }
            }
            const previousStatus = supportTicket.status;
            const previousAssignee = supportTicket.assignedTo;
            await supportTicket.update(req.body);
            // Notify user if ticket was assigned or status changed
            if (req.body.assignedTo && req.body.assignedTo !== previousAssignee) {
                await this.notifyUserAboutAssignment(supportTicket);
            }
            if (req.body.status && req.body.status !== previousStatus) {
                await this.notifyUserAboutStatusChange(supportTicket, previousStatus);
            }
            res.json(supportTicket);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update support ticket' });
        }
    }
    // Delete support ticket
    async deleteSupportTicket(req, res) {
        try {
            const supportTicket = await SupportTicket_model_1.default.findByPk(req.params.id);
            if (!supportTicket) {
                return res.status(404).json({ error: 'Support ticket not found' });
            }
            await supportTicket.destroy();
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to delete support ticket' });
        }
    }
    // Get user's support tickets
    async getUserSupportTickets(req, res) {
        try {
            const userId = req.params.userId;
            const { page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const supportTickets = await SupportTicket_model_1.default.findAndCountAll({
                where: { userId },
                limit: parseInt(limit),
                offset,
                include: [
                    {
                        model: User_model_1.default,
                        as: 'assignee',
                        attributes: ['id', 'email'],
                        include: [{
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json({
                total: supportTickets.count,
                page: parseInt(page),
                totalPages: Math.ceil(supportTickets.count / parseInt(limit)),
                tickets: supportTickets.rows
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get tickets assigned to admin
    async getAssignedTickets(req, res) {
        try {
            const adminId = req.params.adminId;
            const { page = 1, limit = 20, status } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = { assignedTo: adminId };
            if (status)
                where.status = status;
            const supportTickets = await SupportTicket_model_1.default.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email'],
                        include: [{
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }]
                    }
                ],
                order: [
                    ['priority', 'DESC'],
                    ['createdAt', 'DESC']
                ]
            });
            res.json({
                total: supportTickets.count,
                page: parseInt(page),
                totalPages: Math.ceil(supportTickets.count / parseInt(limit)),
                tickets: supportTickets.rows
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get ticket statistics
    async getTicketStatistics(req, res) {
        try {
            const stats = await SupportTicket_model_1.default.findAll({
                attributes: [
                    'status',
                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('status')), 'count']
                ],
                group: ['status']
            });
            const priorityStats = await SupportTicket_model_1.default.findAll({
                attributes: [
                    'priority',
                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('priority')), 'count']
                ],
                group: ['priority']
            });
            const totalTickets = stats.reduce((sum, stat) => sum + parseInt(stat.get('count')), 0);
            const openTickets = stats.find((stat) => stat.get('status') === 'open')?.get('count') || 0;
            res.json({
                total: totalTickets,
                open: openTickets,
                byStatus: stats.map((stat) => ({
                    status: stat.get('status'),
                    count: stat.get('count')
                })),
                byPriority: priorityStats.map((stat) => ({
                    priority: stat.get('priority'),
                    count: stat.get('count')
                }))
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Private helper methods
    async notifyAdminsAboutNewTicket(ticket) {
        try {
            const admins = await User_model_1.default.findAll({
                where: { role: { [sequelize_1.Op.in]: ['admin', 'super_admin'] } },
                attributes: ['id']
            });
            const notifications = admins.map(admin => ({
                userId: admin.id,
                type: 'system',
                title: 'New Support Ticket',
                message: `New support ticket created: ${ticket.subject}`,
                metadata: { ticketId: ticket.id, priority: ticket.priority }
            }));
            if (notifications.length > 0) {
                await Notification_model_1.default.bulkCreate(notifications);
            }
        }
        catch (error) {
            console.error('Failed to notify admins:', error);
        }
    }
    async notifyUserAboutAssignment(ticket) {
        try {
            await Notification_model_1.default.create({
                userId: ticket.userId,
                type: 'system',
                title: 'Support Ticket Assigned',
                message: `Your support ticket has been assigned to an agent.`,
                metadata: { ticketId: ticket.id }
            });
        }
        catch (error) {
            console.error('Failed to notify user:', error);
        }
    }
    async notifyUserAboutStatusChange(ticket, previousStatus) {
        try {
            const statusMessages = {
                'in_progress': 'Your support ticket is now being worked on.',
                'resolved': 'Your support ticket has been resolved.',
                'closed': 'Your support ticket has been closed.'
            };
            if (statusMessages[ticket.status]) {
                await Notification_model_1.default.create({
                    userId: ticket.userId,
                    type: 'system',
                    title: 'Support Ticket Status Updated',
                    message: statusMessages[ticket.status],
                    metadata: {
                        ticketId: ticket.id,
                        previousStatus,
                        newStatus: ticket.status
                    }
                });
            }
        }
        catch (error) {
            console.error('Failed to notify user:', error);
        }
    }
}
exports.default = new SupportTicketController();
