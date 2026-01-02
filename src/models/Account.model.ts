import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ForeignKey } from 'sequelize';
import { sequelize } from '../config/db';
import User from './User.model'; // Change from Profile to User
import Transaction from './Transaction.model';

class Account extends Model<InferAttributes<Account>, InferCreationAttributes<Account>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>; // Change from Profile to User
  declare accountType: CreationOptional<string>;
  declare accountNumber: string;
  declare balance: CreationOptional<number>;
  declare currency: CreationOptional<string>;
  declare status: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare user?: User; // Change from Profile to User

}

Account.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // Change from 'profiles' to 'users'
      key: 'id'
    }
  },
  // ... rest of the fields remain the same
  accountType: {
    type: DataTypes.ENUM('wallet', 'bank_linked'),
    defaultValue: 'wallet'
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'NG'
  },
  status: {
    type: DataTypes.ENUM('active', 'frozen', 'closed'),
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
  tableName: 'accounts',
  timestamps: true
});

// Update associations
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(Account, { foreignKey: 'userId' })

export default Account;