import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog.model';
import Profile from '../models/Profile.model';
import { validationResult } from 'express-validator';
import { col, fn, Op } from 'sequelize';
import User from '../models/User.model';

class AuditLogController {
  // Get all audit logs (admin only)
  async getAllAuditLogs(req: Request, res: Response) {
    try {
      const { page = 1, limit = 100, adminId, resourceType, startDate, endDate } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const where: any = {};
      if (adminId) where.adminId = adminId;
      if (resourceType) where.resourceType = resourceType;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate as string);
      }

      const auditLogs = await AuditLog.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset,
        include: [
          { model: Profile, as: 'admin', attributes: ['id', 'fullName', 'email', 'role'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        status: 'success', 
        data: {
        total: auditLogs.count,
        page: parseInt(page as string),
        totalPages: Math.ceil(auditLogs.count / parseInt(limit as string)),
        logs: auditLogs.rows
      }, 
      message: 'logs found'});
    } catch (error) {
      res.status(500).json({status: 'fail', data: null, message: 'Internal server error' });
    } 
  }

  // Get audit log by ID
  async getAuditLogById(req: Request, res: Response) {
    try {
      const auditLog = await AuditLog.findByPk(req.params.id, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id','email', 'role'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id','fullName']
              }
            ] 
          }
        ]
      });
      if (!auditLog) {
        return res.status(404).json({ error: 'Audit log not found' });
      }
      res.json(auditLog);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create audit log (admin only)
  async createAuditLog(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Verify admin exists
      const admin = await User.findByPk(req.body.adminId);
      if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
        return res.status(400).json({ error: 'Admin not found or not authorized' });
      }

      const auditLog = await AuditLog.create(req.body);
      res.status(201).json(auditLog);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create audit log' });
    }
  }

  // Get audit logs by admin
  async getAuditLogsByAdmin(req: Request, res: Response) {
    try {
      const userId = req.params.adminId;
      const { page = 1, limit = 50 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const auditLogs = await AuditLog.findAndCountAll({
        where: { userId },
        limit: parseInt(limit as string),
        offset,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id','email'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id','fullName']
              }
            ] 
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        total: auditLogs.count,
        page: parseInt(page as string),
        totalPages: Math.ceil(auditLogs.count / parseInt(limit as string)),
        logs: auditLogs.rows
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get audit logs by resource
  async getAuditLogsByResource(req: Request, res: Response) {
    try {
      const { resourceType, resourceId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const auditLogs = await AuditLog.findAndCountAll({
        where: { resourceType, resourceId },
        limit: parseInt(limit as string),
        offset,
        include: [
         { 
            model: User, 
            as: 'user', 
            attributes: ['id','email', 'role'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id','fullName']
              }
            ] 
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        total: auditLogs.count,
        page: parseInt(page as string),
        totalPages: Math.ceil(auditLogs.count / parseInt(limit as string)),
        logs: auditLogs.rows
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get audit statistics
  async getAuditStatistics(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      const where: any = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate as string);
      }

      // Get action counts
      const actionStats = await AuditLog.findAll({
        attributes: [
          'action',
          [fn('COUNT', col('action')), 'count']
        ],
        where,
        group: ['action'],
        order: [[fn('COUNT', col('action')), 'DESC']],
        limit: 10
      });

      // Get admin activity
      const adminStats = await AuditLog.findAll({
        attributes: [
          'adminId',
          [fn('COUNT', col('adminId')), 'count']
        ],
        include: [
         { 
            model: User, 
            as: 'user', 
            attributes: ['id','email', 'role'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id','fullName']
              }
            ] 
          }
        ],
        where,
        group: ['adminId', 'admin.id', 'admin.fullName', 'admin.email'],
        order: [[fn('COUNT', col('adminId')), 'DESC']],
        limit: 10
      });

      // Get resource type counts
      const resourceStats = await AuditLog.findAll({
        attributes: [
          'resourceType',
          [fn('COUNT', col('resourceType')), 'count']
        ],
        where,
        group: ['resourceType'],
        order: [[fn('COUNT', col('resourceType')), 'DESC']]
      });

      const totalLogs = actionStats.reduce((sum, stat: any) => 
        sum + parseInt(stat.get('count')), 0
      );

      res.json({
        totalLogs,
        topActions: actionStats.map((stat: any) => ({
          action: stat.get('action'),
          count: stat.get('count')
        })),
        topAdmins: adminStats.map((stat: any) => ({
          adminId: stat.get('adminId'),
          adminName: stat.admin?.fullName,
          adminEmail: stat.admin?.email,
          count: stat.get('count')
        })),
        byResourceType: resourceStats.map((stat: any) => ({
          resourceType: stat.get('resourceType'),
          count: stat.get('count')
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AuditLogController();