
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ForeignKey } from 'sequelize';
import { sequelize } from '../config/db';
import SupportTicket from './SupportTicket.model';

class TicketReply extends Model<InferAttributes<TicketReply>, InferCreationAttributes<TicketReply>> {
    declare id: CreationOptional<string>;
    declare ticketId: ForeignKey<string>;
    declare subject: string;
    declare message: string;
    declare status: CreationOptional<string>;
    declare priority: CreationOptional<string>;
    declare assignedTo: CreationOptional<ForeignKey<string>>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare user?: any;
    declare assignee?: any;
}

TicketReply.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'support-tickets',
            key: 'id'
        }
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
    },
    assignedTo: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    tableName: 'ticket-replies',
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['status'] },
        { fields: ['priority'] },
        { fields: ['assignedTo'] }
    ]
});

TicketReply.belongsTo(SupportTicket, { foreignKey: 'ticketId', as: 'ticket' });
SupportTicket.hasMany(TicketReply, { foreignKey: 'ticketId', as: 'replies' });

export default TicketReply;
