
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ForeignKey } from 'sequelize';
import { sequelize } from '../config/db';
import User from './User.model';
import Account from './Account.model';

class LinkedAccount extends Model<InferAttributes<LinkedAccount>, InferCreationAttributes<LinkedAccount>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>;
  declare accountId: ForeignKey<string>;
  declare externalAccountType: string;
  declare externalAccountData: CreationOptional<any>;
  declare status: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  
  declare user?: any;
  declare account?: any;
}

LinkedAccount.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'profiles',
      key: 'id'
    }
  },
  accountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  externalAccountType: {
    type: DataTypes.ENUM('bank', 'card'),
    allowNull: false
  },
  externalAccountData: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'expired'),
    defaultValue: 'active'
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
  tableName: 'linked_accounts',
  timestamps: true
});

LinkedAccount.belongsTo(User, { foreignKey: 'userId', as: 'user' });
LinkedAccount.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
User.hasMany(LinkedAccount, { foreignKey: 'userId' });
Account.hasMany(LinkedAccount, { foreignKey: 'accountId' });

export default LinkedAccount;
