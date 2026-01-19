"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuditLog_model_1 = __importDefault(require("../models/AuditLog.model"));
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const express_validator_1 = require("express-validator");
const sequelize_1 = require("sequelize");
const User_model_1 = __importDefault(require("../models/User.model"));
class AuditLogController {
    // Get all audit logs (admin only)
    async getAllAuditLogs(req, res) {
        try {
            const { page = 1, limit = 100, adminId, resourceType, startDate, endDate } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            if (adminId)
                where.adminId = adminId;
            if (resourceType)
                where.resourceType = resourceType;
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt[sequelize_1.Op.gte] = new Date(startDate);
                if (endDate)
                    where.createdAt[sequelize_1.Op.lte] = new Date(endDate);
            }
            const auditLogs = await AuditLog_model_1.default.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                include: [
                    { model: Profile_model_1.default, as: 'admin', attributes: ['id', 'fullName', 'email', 'role'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json({
                status: 'success',
                data: {
                    total: auditLogs.count,
                    page: parseInt(page),
                    totalPages: Math.ceil(auditLogs.count / parseInt(limit)),
                    logs: auditLogs.rows
                },
                message: 'logs found'
            });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Get audit log by ID
    async getAuditLogById(req, res) {
        try {
            const auditLog = await AuditLog_model_1.default.findByPk(req.params.id, {
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email', 'role'],
                        include: [
                            {
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }
                        ]
                    }
                ]
            });
            if (!auditLog) {
                return res.status(404).json({ error: 'Audit log not found' });
            }
            res.json(auditLog);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Create audit log (admin only)
    async createAuditLog(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            // Verify admin exists
            const admin = await User_model_1.default.findByPk(req.body.adminId);
            if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
                return res.status(400).json({ error: 'Admin not found or not authorized' });
            }
            const auditLog = await AuditLog_model_1.default.create(req.body);
            res.status(201).json(auditLog);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create audit log' });
        }
    }
    // Get audit logs by admin
    async getAuditLogsByAdmin(req, res) {
        try {
            const userId = req.params.adminId;
            const { page = 1, limit = 50 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const auditLogs = await AuditLog_model_1.default.findAndCountAll({
                where: { userId },
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
                                attributes: ['id', 'fullName']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json({
                total: auditLogs.count,
                page: parseInt(page),
                totalPages: Math.ceil(auditLogs.count / parseInt(limit)),
                logs: auditLogs.rows
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get audit logs by resource
    async getAuditLogsByResource(req, res) {
        try {
            const { resourceType, resourceId } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const auditLogs = await AuditLog_model_1.default.findAndCountAll({
                where: { resourceType, resourceId },
                limit: parseInt(limit),
                offset,
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email', 'role'],
                        include: [
                            {
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json({
                total: auditLogs.count,
                page: parseInt(page),
                totalPages: Math.ceil(auditLogs.count / parseInt(limit)),
                logs: auditLogs.rows
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get audit statistics
    async getAuditStatistics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const where = {};
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt[sequelize_1.Op.gte] = new Date(startDate);
                if (endDate)
                    where.createdAt[sequelize_1.Op.lte] = new Date(endDate);
            }
            // Get action counts
            const actionStats = await AuditLog_model_1.default.findAll({
                attributes: [
                    'action',
                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('action')), 'count']
                ],
                where,
                group: ['action'],
                order: [[(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('action')), 'DESC']],
                limit: 10
            });
            // Get admin activity
            const adminStats = await AuditLog_model_1.default.findAll({
                attributes: [
                    'adminId',
                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('adminId')), 'count']
                ],
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email', 'role'],
                        include: [
                            {
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }
                        ]
                    }
                ],
                where,
                group: ['adminId', 'admin.id', 'admin.fullName', 'admin.email'],
                order: [[(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('adminId')), 'DESC']],
                limit: 10
            });
            // Get resource type counts
            const resourceStats = await AuditLog_model_1.default.findAll({
                attributes: [
                    'resourceType',
                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('resourceType')), 'count']
                ],
                where,
                group: ['resourceType'],
                order: [[(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('resourceType')), 'DESC']]
            });
            const totalLogs = actionStats.reduce((sum, stat) => sum + parseInt(stat.get('count')), 0);
            res.json({
                totalLogs,
                topActions: actionStats.map((stat) => ({
                    action: stat.get('action'),
                    count: stat.get('count')
                })),
                topAdmins: adminStats.map((stat) => ({
                    adminId: stat.get('adminId'),
                    adminName: stat.admin?.fullName,
                    adminEmail: stat.admin?.email,
                    count: stat.get('count')
                })),
                byResourceType: resourceStats.map((stat) => ({
                    resourceType: stat.get('resourceType'),
                    count: stat.get('count')
                }))
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.default = new AuditLogController();
