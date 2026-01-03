"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const User_model_1 = __importDefault(require("./User.model"));
class Transaction extends sequelize_1.Model {
}
Transaction.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    fromAccountId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    },
    toAccountId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(3),
        defaultValue: 'USD'
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('transfer', 'deposit', 'payment', 'external_transfer', 'bill_payment', 'refund', 'reversal'),
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'failed', 'flagged', 'reversed'),
        defaultValue: 'pending'
    },
    description: {
        type: sequelize_1.DataTypes.TEXT
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        defaultValue: {}
    },
    flaggedReason: {
        type: sequelize_1.DataTypes.TEXT
    },
    reviewedBy: {
        type: sequelize_1.DataTypes.UUID
    },
    reviewedAt: {
        type: sequelize_1.DataTypes.DATE
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
    tableName: 'transactions',
    timestamps: true,
    indexes: [
        { fields: ['fromAccountId'] },
        { fields: ['toAccountId'] },
        { fields: ['status'] },
        { fields: ['createdAt'] }
    ]
});
Transaction.belongsTo(User_model_1.default, { foreignKey: 'fromAccountId', as: 'fromAccount' });
Transaction.belongsTo(User_model_1.default, { foreignKey: 'toAccountId', as: 'toAccount' });
Transaction.belongsTo(User_model_1.default, { foreignKey: 'reviewedBy', as: 'reviewer' });
User_model_1.default.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
exports.default = Transaction;
