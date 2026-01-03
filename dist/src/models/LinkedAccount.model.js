"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const User_model_1 = __importDefault(require("./User.model"));
const Account_model_1 = __importDefault(require("./Account.model"));
class LinkedAccount extends sequelize_1.Model {
}
LinkedAccount.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'profiles',
            key: 'id'
        }
    },
    accountId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    externalAccountType: {
        type: sequelize_1.DataTypes.ENUM('bank', 'card'),
        allowNull: false
    },
    externalAccountData: {
        type: sequelize_1.DataTypes.JSONB,
        defaultValue: {}
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'expired'),
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
    tableName: 'linked_accounts',
    timestamps: true
});
LinkedAccount.belongsTo(User_model_1.default, { foreignKey: 'userId', as: 'user' });
LinkedAccount.belongsTo(Account_model_1.default, { foreignKey: 'accountId', as: 'account' });
User_model_1.default.hasMany(LinkedAccount, { foreignKey: 'userId' });
Account_model_1.default.hasMany(LinkedAccount, { foreignKey: 'accountId' });
exports.default = LinkedAccount;
