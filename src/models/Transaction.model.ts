import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ForeignKey } from 'sequelize';
import { sequelize } from '../config/db';
import User from './User.model';

class Transaction extends Model<InferAttributes<Transaction>, InferCreationAttributes<Transaction>> {
  declare id: CreationOptional<string>;
  declare fromAccountId: ForeignKey<string>;
  declare toAccountId: ForeignKey<string>;
  declare amount: number;
  declare currency: CreationOptional<string>;
  declare type: string;
  declare status: CreationOptional<string>;
  declare description: CreationOptional<string>;
  declare metadata: CreationOptional<any>;
  declare flaggedReason: CreationOptional<string>;
  declare reviewedBy: CreationOptional<ForeignKey<string>>;
  declare reviewedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // virtual account
  declare fromAccount?: User;
  declare toAccount?: User;
  declare reviewer?: User;

}

Transaction.init({ 
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  fromAccountId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  toAccountId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  type: {
    type: DataTypes.ENUM('transfer','deposit', 'payment','external_transfer', 'bill_payment', 'refund', 'reversal'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'flagged', 'reversed'),
    defaultValue: 'pending'
  },
  description: {
    type: DataTypes.TEXT
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  flaggedReason: {
    type: DataTypes.TEXT
  },
  reviewedBy: {
    type: DataTypes.UUID
  },
  reviewedAt: {
    type: DataTypes.DATE
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
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    { fields: ['fromAccountId'] },
    { fields: ['toAccountId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});


Transaction.belongsTo(User, { foreignKey: 'fromAccountId', as: 'fromAccount' })
Transaction.belongsTo(User, { foreignKey: 'toAccountId', as: 'toAccount' })
Transaction.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' })

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' })

export default Transaction; 