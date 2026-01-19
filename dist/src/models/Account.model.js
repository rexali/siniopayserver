"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const User_model_1 = __importDefault(require("./User.model")); // Change from Profile to User
const Transaction_model_1 = __importDefault(require("./Transaction.model"));
class Account extends sequelize_1.Model {
}
Account.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users', // Change from 'profiles' to 'users'
            key: 'id'
        }
    },
    // ... rest of the fields remain the same
    accountType: {
        type: sequelize_1.DataTypes.ENUM('wallet', 'bank_linked'),
        defaultValue: 'wallet'
    },
    accountNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    balance: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(3),
        defaultValue: 'NG'
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'frozen', 'closed'),
        defaultValue: 'active'
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: db_1.sequelize,
    tableName: 'accounts',
    timestamps: true
});
// Update associations
Account.belongsTo(User_model_1.default, { foreignKey: 'userId', as: 'user' });
User_model_1.default.hasMany(Account, { foreignKey: 'userId' });
Account.hasMany(Transaction_model_1.default, { foreignKey: 'accountId', as: 'transactions' });
Transaction_model_1.default.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
exports.default = Account;
