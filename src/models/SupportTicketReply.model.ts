import { 
  CreationOptional, 
  DataTypes, 
  InferAttributes, 
  InferCreationAttributes, 
  Model, 
  ForeignKey 
} from 'sequelize';
import { sequelize } from '../config/db';
import SupportTicket from './SupportTicket.model';
import User from './User.model';

class SupportTicketReply extends Model<
  InferAttributes<SupportTicketReply>, 
  InferCreationAttributes<SupportTicketReply>
> {
  declare id: CreationOptional<string>;
  declare ticketId: ForeignKey<string>;
  declare userId: ForeignKey<string>;
  declare message: string;
  declare attachments: CreationOptional<any[]>;
  declare isInternalNote: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Virtual associations
  declare ticket?: SupportTicket;
  declare user?: User;
}

SupportTicketReply.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'support_tickets',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 5000]
      }
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isValidAttachments(value: any[]) {
          if (!Array.isArray(value)) {
            throw new Error('Attachments must be an array');
          }
          if (value.length > 5) {
            throw new Error('Cannot have more than 5 attachments');
          }
          value.forEach((attachment, index) => {
            if (!attachment.name || !attachment.url) {
              throw new Error(`Attachment at index ${index} must have name and url`);
            }
            if (!attachment.url.startsWith('http')) {
              throw new Error(`Attachment at index ${index} must have a valid URL`);
            }
          });
        }
      }
    },
    isInternalNote: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'support_ticket_replies',
    timestamps: true,
    indexes: [
      {
        fields: ['ticketId'],
        name: 'idx_support_ticket_replies_ticket_id'
      },
      {
        fields: ['userId'],
        name: 'idx_support_ticket_replies_user_id'
      },
      {
        fields: ['createdAt'],
        name: 'idx_support_ticket_replies_created_at'
      },
      {
        fields: ['isInternalNote'],
        name: 'idx_support_ticket_replies_internal_note'
      }
    ],
    hooks: {
      afterCreate: async (reply: SupportTicketReply) => {
        try {
          // Update the ticket's updatedAt timestamp
          await SupportTicket.update(
            { updatedAt: new Date() },
            { where: { id: reply.ticketId } }
          );

          // Send notifications
          await sendReplyNotifications(reply);
        } catch (error) {
          console.error('Error in afterCreate hook:', error);
        }
      },
      afterUpdate: async (reply: SupportTicketReply) => {
        // Update the ticket's updatedAt timestamp
        await SupportTicket.update(
          { updatedAt: new Date() },
          { where: { id: reply.ticketId } }
        );
      }
    }
  }
);

// Helper function to send notifications
async function sendReplyNotifications(reply: SupportTicketReply) {
  try {
    const Notification = (await import('./Notification.model')).default;
    const ticket = await SupportTicket.findByPk(reply.ticketId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!ticket || !ticket.user) return;

    // Get all users involved in the ticket (excluding the reply author)
    const allReplies = await SupportTicketReply.findAll({
      where: { ticketId: reply.ticketId },
      attributes: ['userId'],
      group: ['userId']
    });

    const userIds = allReplies
      .map(r => r.userId)
      .filter(id => id !== reply.userId && id !== ticket.userId);

    // Add ticket owner if not already included
    if (!userIds.includes(ticket.userId) && ticket.userId !== reply.userId) {
      userIds.push(ticket.userId);
    }

    // Send notifications
    const notifications = userIds.map(userId => ({
      userId,
      type: 'system',
      title: reply.isInternalNote 
        ? 'Internal Note Added to Ticket' 
        : 'New Reply on Support Ticket',
      message: reply.isInternalNote
        ? `An internal note has been added to ticket #${ticket.id.substring(0, 8)}`
        : `A new reply has been posted on ticket #${ticket.id.substring(0, 8)}`,
      metadata: {
        ticketId: ticket.id,
        replyId: reply.id,
        isInternalNote: reply.isInternalNote,
        ticketSubject: ticket.subject
      }
    }));

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }
  } catch (error) {
    console.error('Failed to send reply notifications:', error);
  }
}

// Set up associations
SupportTicketReply.belongsTo(SupportTicket, { 
  foreignKey: 'ticketId', 
  as: 'ticket' 
});

SupportTicketReply.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

SupportTicket.hasMany(SupportTicketReply, { 
  foreignKey: 'ticketId', 
  as: 'replies' 
});

User.hasMany(SupportTicketReply, { 
  foreignKey: 'userId', 
  as: 'ticketReplies' 
});

export default SupportTicketReply;