
import { Request, Response } from 'express';
import SupportTicket from '../models/SupportTicket.model';
import Profile from '../models/Profile.model';
import Notification from '../models/Notification.model';
import { validationResult } from 'express-validator';
import { col, fn, Op } from 'sequelize';
import User from '../models/User.model';
import { error } from 'console';

class SupportTicketController {
  // Get all support tickets (admin only)
  async getAllSupportTickets(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, status, priority, assignedTo } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (assignedTo) where.assignedTo = assignedTo;

      const supportTickets = await SupportTicket.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email'],
            include: [{
              model: Profile,
              as: 'profile',
              attributes: ['id', 'fullName']
            }]
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'email'],
            include: [{
              model: Profile,
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
        status: 'success',
        data: {
          total: supportTickets.count,
          page: parseInt(page as string),
          totalPages: Math.ceil(supportTickets.count / parseInt(limit as string)),
          tickets: supportTickets.rows
        },
        message: 'Tickets found'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Get support ticket by ID
  async getSupportTicketById(req: Request, res: Response) {
    try {
      const supportTicket = await SupportTicket.findByPk(req.params.id, {
        include: [
          {
            model: User, as: 'user',
            attributes: ['id', 'email'],
            include: [{
              model: Profile,
              as: 'profile',
              attributes: ['id', 'fullName', 'phone']
            }]
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'email'],
            include: [{
              model: Profile,
              as: 'profile',
              attributes: ['id', 'fullName']
            }]
          }
        ]
      });
      if (!supportTicket) {
        return res.status(404).json({ status: 'fail', data: null, message: 'Support ticket not found' });
      }
      res.json({ status: 'success', data: { supportTicket }, message: 'Ticket found' });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Create support ticket
  async createSupportTicket(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed' });
    }

    try {
      // Check if user exists
      const user = await User.findByPk(req.body.userId);
      if (!user) {
        return res.status(404).json({ status: 'fail', data: null, message: 'User not found' });
      }

      const supportTicket = await SupportTicket.create(req.body);

      // Create notification for admins
      // await this.notifyAdminsAboutNewTicket(supportTicket);

      res.status(201).json({ status: 'success', data: { ticket: supportTicket }, message: 'Ticket created' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Update support ticket
  async updateSupportTicket(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());

      return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed' });
    }

    try {
      const supportTicket = await SupportTicket.findByPk(req.params.id);
      if (!supportTicket) {
        return res.status(404).json({ status: 'fail', data: null, message: 'Support ticket not found' });
      }

      // Check if assignedTo is a valid admin
      if (req.body.assignedTo) {
        const assignee = await User.findByPk(req.body.assignedTo);
        if (!assignee || !['admin', 'super_admin'].includes(assignee.role)) {
          return res.status(400).json({ status: 'fail', data: null, message: 'Assignee must be an admin' });
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

      res.json({ status: 'success', data: { supportTicket }, message: 'Ticket updated' });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Failed to update support ticket' });
    }
  }

  // Delete support ticket
  async deleteSupportTicket(req: Request, res: Response) {
    try {
      const supportTicket = await SupportTicket.findByPk(req.params.id);
      if (!supportTicket) {
        return res.status(404).json({ status: 'fail', data: null, message: 'Support ticket not found' });
      }

      await supportTicket.destroy();
      res.status(204).json({ status: 'success', data: {}, message: 'Ticket deleted' });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Failed to delete support ticket' });
    }
  }

  // Get user's support tickets
  async getUserSupportTickets(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const supportTickets = await SupportTicket.findAndCountAll({
        where: { userId },
        limit: parseInt(limit as string),
        offset,
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'email'],
            include: [{
              model: Profile,
              as: 'profile',
              attributes: ['id', 'fullName']
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        status: 'success',
        data: {
          total: supportTickets.count,
          page: parseInt(page as string),
          totalPages: Math.ceil(supportTickets.count / parseInt(limit as string)),
          tickets: supportTickets.rows
        }, message: 'Tickets found'
      });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Get tickets assigned to admin
  async getAssignedTickets(req: Request, res: Response) {
    try {
      const adminId = req.params.adminId;
      const { page = 1, limit = 20, status } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = { assignedTo: adminId };
      if (status) where.status = status;

      const supportTickets = await SupportTicket.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email'],
            include: [{
              model: Profile,
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
        status: 'success',
        data: {
          total: supportTickets.count,
          page: parseInt(page as string),
          totalPages: Math.ceil(supportTickets.count / parseInt(limit as string)),
          tickets: supportTickets.rows
        },
        message: 'Tickets found'
      });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Get ticket statistics
  async getTicketStatistics(req: Request, res: Response) {
    try {
      const stats = await SupportTicket.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('status')), 'count']
        ],
        group: ['status']
      });

      const priorityStats = await SupportTicket.findAll({
        attributes: [
          'priority',
          [fn('COUNT', col('priority')), 'count']
        ],
        group: ['priority']
      });

      const totalTickets = stats.reduce((sum, stat: any) => sum + parseInt(stat.get('count')), 0);
      const openTickets = stats.find((stat: any) => stat.get('status') === 'open')?.get('count') || 0;

      res.json({
        status: 'success',
        data: {
          total: totalTickets,
          open: openTickets,
          byStatus: stats.map((stat: any) => ({
            status: stat.get('status'),
            count: stat.get('count')
          })),
          byPriority: priorityStats.map((stat: any) => ({
            priority: stat.get('priority'),
            count: stat.get('count')
          }))
        },
        message: 'Ticket statistics'
      });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Private helper methods
  private async notifyAdminsAboutNewTicket(ticket: SupportTicket) {
    try {
      const admins = await User.findAll({
        where: { role: { [Op.in]: ['admin', 'super_admin'] } },
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
        await Notification.bulkCreate(notifications);
      }
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }

  private async notifyUserAboutAssignment(ticket: SupportTicket) {
    try {
      await Notification.create({
        userId: ticket.userId,
        type: 'system',
        title: 'Support Ticket Assigned',
        message: `Your support ticket has been assigned to an agent.`,
        metadata: { ticketId: ticket.id }
      });
    } catch (error) {
      console.error('Failed to notify user:', error);
    }
  }

  private async notifyUserAboutStatusChange(ticket: SupportTicket, previousStatus: string) {
    try {
      const statusMessages: { [key: string]: string } = {
        'in_progress': 'Your support ticket is now being worked on.',
        'resolved': 'Your support ticket has been resolved.',
        'closed': 'Your support ticket has been closed.'
      };

      if (statusMessages[ticket.status]) {
        await Notification.create({
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
    } catch (error) {
      console.error('Failed to notify user:', error);
    }
  }
}

export default new SupportTicketController();
