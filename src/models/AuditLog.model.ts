import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ForeignKey } from 'sequelize';
import { sequelize } from '../config/db';
import User from './User.model';

class AuditLog extends Model<InferAttributes<AuditLog>, InferCreationAttributes<AuditLog>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>;
  declare action: string;
  declare resourceType: string;
  declare resourceId: CreationOptional<string>;
  declare details: CreationOptional<any>;
  declare createdAt: CreationOptional<Date>;
  
  declare admin?: any;
}

AuditLog.init({
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
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resourceType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resourceId: {
    type: DataTypes.UUID
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['resourceType', 'resourceId'] },
    { fields: ['createdAt'] }
  ]
});

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'userId' });

export default AuditLog;
