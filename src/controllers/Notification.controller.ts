
import { Request, Response } from 'express';
import Notification from '../models/Notification.model';
import Profile from '../models/Profile.model';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User.model';

class NotificationController {
  // Get all notifications (admin only)
  async getAllNotifications(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, type, read } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {};
      if (type) where.type = type;
      if (read !== undefined) where.read = read === 'true';

      const notifications = await Notification.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
              {
                model: Profile,
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
          page: parseInt(page as string),
          totalPages: Math.ceil(notifications.count / parseInt(limit as string)),
          notifications: notifications.rows
        },
        message: 'Notifications found'
      });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Get notification by ID
  async getNotificationById(req: Request, res: Response) {
    try {
      const notification = await Notification.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
              {
                model: Profile,
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
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Create notification
  async createNotification(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({ status: 'fail', data: null, message: 'Failed validation' });
    }

    try {
      // Check if user exists
      const user = await User.findByPk(req.body.userId);
      if (!user) {
        return res.status(404).json({ status: 'fail', data: null, message: 'User not found' });
      }

      const notification = await Notification.create(req.body);
      res.status(201).json({ status: 'success', data: { notification }, message: 'Notification created' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', data: null, message: 'Failed to create notification' });
    }
  }

  // Update notification (mark as read)
  async updateNotification(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed' });
    }

    try {
      const notification = await Notification.findByPk(req.params.id);
      if (!notification) {
        return res.status(404).json({ status: 'fail', data: null, message: 'Notification not found' });
      }

      // Only allow updating read status for non-admins
      const userId = (req as any).user?.id;
      if (notification.userId !== userId) {
        return res.status(403).json({ status: 'fail', data: null, message: 'Cannot update notifications for other users' });
      }

      const updatedNotification = await notification.update(req.body);
      res.json({ status: 'success', data: { notification: updatedNotification }, message: 'Notification updated' });
    } catch (error) {
      console.error(error);

      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Get user's notifications
  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const { page = 1, limit = 20, unreadOnly = 'true' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = { userId };

      if (unreadOnly === 'true') {
        where.read = false;
      }

      const notifications = await Notification.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json(
        {
          status: 'success',
          data: {
            total: notifications.count,
            unreadCount: await Notification.count({ where: { userId, read: false } }),
            page: parseInt(page as string),
            totalPages: Math.ceil(notifications.count / parseInt(limit as string)),
            notifications: notifications.rows
          },
          message: 'Notifications found'
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.params.userId;

      await Notification.update(
        { read: true },
        { where: { userId, read: false } }
      );

      res.json({ status: 'success', data: {}, message:'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({  status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Bulk create notifications
  async bulkCreateNotifications(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed'});
    }

    try {
      const { notifications } = req.body;

      // Validate all users exist
      const userIds = [...new Set(notifications.map((n: any) => n.userId))] as Array<any>;
      const users = await User.findAll({
        // where: { id: userIds },
        where: {
          id: { [Op.in]: userIds }
        },
        attributes: ['id']
      });

      const validUserIds = users.map(user => user.id);
      const validNotifications = notifications.filter((n: any) =>
        validUserIds.includes(n.userId)
      );

      if (validNotifications.length === 0) {
        return res.status(400).json({ status: 'fail', data: null, message:'No valid users found' });
      }

      const notification = await Notification.bulkCreate(validNotifications);
      res.status(201).json({ status: 'success', data: {notification}, message: 'Notification creted'});
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Failed to create notifications' });
    }
  }
}

export default new NotificationController();