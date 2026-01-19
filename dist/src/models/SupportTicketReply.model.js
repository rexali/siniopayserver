"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const SupportTicket_model_1 = __importDefault(require("./SupportTicket.model"));
const User_model_1 = __importDefault(require("./User.model"));
class SupportTicketReply extends sequelize_1.Model {
}
SupportTicketReply.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    ticketId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'support_tickets',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 5000]
        }
    },
    attachments: {
        type: sequelize_1.DataTypes.JSONB,
        defaultValue: [],
        validate: {
            isValidAttachments(value) {
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
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: db_1.sequelize,
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
        afterCreate: async (reply) => {
            try {
                // Update the ticket's updatedAt timestamp
                await SupportTicket_model_1.default.update({ updatedAt: new Date() }, { where: { id: reply.ticketId } });
                // Send notifications
                await sendReplyNotifications(reply);
            }
            catch (error) {
                console.error('Error in afterCreate hook:', error);
            }
        },
        afterUpdate: async (reply) => {
            // Update the ticket's updatedAt timestamp
            await SupportTicket_model_1.default.update({ updatedAt: new Date() }, { where: { id: reply.ticketId } });
        }
    }
});
// Helper function to send notifications
async function sendReplyNotifications(reply) {
    try {
        const Notification = (await Promise.resolve().then(() => __importStar(require('./Notification.model')))).default;
        const ticket = await SupportTicket_model_1.default.findByPk(reply.ticketId, {
            include: [{ model: User_model_1.default, as: 'user' }]
        });
        if (!ticket || !ticket.user)
            return;
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
    }
    catch (error) {
        console.error('Failed to send reply notifications:', error);
    }
}
// Set up associations
SupportTicketReply.belongsTo(SupportTicket_model_1.default, {
    foreignKey: 'ticketId',
    as: 'ticket'
});
SupportTicketReply.belongsTo(User_model_1.default, {
    foreignKey: 'userId',
    as: 'user'
});
SupportTicket_model_1.default.hasMany(SupportTicketReply, {
    foreignKey: 'ticketId',
    as: 'replies'
});
User_model_1.default.hasMany(SupportTicketReply, {
    foreignKey: 'userId',
    as: 'ticketReplies'
});
exports.default = SupportTicketReply;
