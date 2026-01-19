"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_model_1 = __importDefault(require("../models/Notification.model"));
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const express_validator_1 = require("express-validator");
const sequelize_1 = require("sequelize");
const User_model_1 = __importDefault(require("../models/User.model"));
class NotificationController {
    // Get all notifications (admin only)
    async getAllNotifications(req, res) {
        try {
            const { page = 1, limit = 50, type, read } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            if (type)
                where.type = type;
            if (read !== undefined)
                where.read = read === 'true';
            const notifications = await Notification_model_1.default.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email'],
                        include: [
                            {
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ["id", 'fullName']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json({
                status: 'success',
                data: {
                    total: notifications.count,
                    page: parseInt(page),
                    totalPages: Math.ceil(notifications.count / parseInt(limit)),
                    notifications: notifications.rows
                },
                message: 'Notifications found'
            });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Get notification by ID
    async getNotificationById(req, res) {
        try {
            const notification = await Notification_model_1.default.findByPk(req.params.id, {
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email'],
                        include: [
                            {
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ["id", 'fullName']
                            }
                        ]
                    }
                ],
            });
            if (!notification) {
                return res.status(404).json({ status: 'fail', data: { notification }, message: 'Notification not found' });
            }
            res.json({ status: 'success', data: { notification }, message: 'Notification found' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Create notification
    async createNotification(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(400).json({ status: 'fail', data: null, message: 'Failed validation' });
        }
        try {
            // Check if user exists
            const user = await User_model_1.default.findByPk(req.body.userId);
            if (!user) {
                return res.status(404).json({ status: 'fail', data: null, message: 'User not found' });
            }
            const notification = await Notification_model_1.default.create(req.body);
            res.status(201).json({ status: 'success', data: { notification }, message: 'Notification created' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ status: 'fail', data: null, message: 'Failed to create notification' });
        }
    }
    // Update notification (mark as read)
    async updateNotification(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed' });
        }
        try {
            const notification = await Notification_model_1.default.findByPk(req.params.id);
            if (!notification) {
                return res.status(404).json({ status: 'fail', data: null, message: 'Notification not found' });
            }
            // Only allow updating read status for non-admins
            const userId = req.user?.id;
            if (notification.userId !== userId) {
                return res.status(403).json({ status: 'fail', data: null, message: 'Cannot update notifications for other users' });
            }
            const updatedNotification = await notification.update(req.body);
            res.json({ status: 'success', data: { notification: updatedNotification }, message: 'Notification updated' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Get user's notifications
    async getUserNotifications(req, res) {
        try {
            const userId = req.params.userId;
            const { page = 1, limit = 20, unreadOnly = 'true' } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = { userId };
            if (unreadOnly === 'true') {
                where.read = false;
            }
            const notifications = await Notification_model_1.default.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });
            res.json({
                status: 'success',
                data: {
                    total: notifications.count,
                    unreadCount: await Notification_model_1.default.count({ where: { userId, read: false } }),
                    page: parseInt(page),
                    totalPages: Math.ceil(notifications.count / parseInt(limit)),
                    notifications: notifications.rows
                },
                message: 'Notifications found'
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Mark all notifications as read
    async markAllAsRead(req, res) {
        try {
            const userId = req.params.userId;
            await Notification_model_1.default.update({ read: true }, { where: { userId, read: false } });
            res.json({ status: 'success', data: {}, message: 'All notifications marked as read' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Bulk create notifications
    async bulkCreateNotifications(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed' });
        }
        try {
            const { notifications } = req.body;
            // Validate all users exist
            const userIds = [...new Set(notifications.map((n) => n.userId))];
            const users = await User_model_1.default.findAll({
                // where: { id: userIds },
                where: {
                    id: { [sequelize_1.Op.in]: userIds }
                },
                attributes: ['id']
            });
            const validUserIds = users.map(user => user.id);
            const validNotifications = notifications.filter((n) => validUserIds.includes(n.userId));
            if (validNotifications.length === 0) {
                return res.status(400).json({ status: 'fail', data: null, message: 'No valid users found' });
            }
            const notification = await Notification_model_1.default.bulkCreate(validNotifications);
            res.status(201).json({ status: 'success', data: { notification }, message: 'Notification creted' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Failed to create notifications' });
        }
    }
}
exports.default = new NotificationController();
