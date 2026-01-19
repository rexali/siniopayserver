
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ForeignKey } from 'sequelize';
import { sequelize } from '../config/db';
import Profile from './Profile.model';
import User from './User.model';

class SupportTicket extends Model<InferAttributes<SupportTicket>, InferCreationAttributes<SupportTicket>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>;
  declare subject: string;
  declare message: string;
  declare status: CreationOptional<string>;
  declare priority: CreationOptional<string>;
  declare assignedTo: CreationOptional<ForeignKey<string>>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // virtual
  declare user?: any;
  declare assignee?: any;
  declare replies?:any
}

SupportTicket.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
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
  tableName: 'support_tickets',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['assignedTo'] }
  ]
});

SupportTicket.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SupportTicket.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
User.hasMany(SupportTicket, { foreignKey: 'userId' });
User.hasMany(SupportTicket, { foreignKey: 'assignedTo', as: 'assignedTickets' });

export default SupportTicket;
