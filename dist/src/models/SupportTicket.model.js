"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const User_model_1 = __importDefault(require("./User.model"));
class SupportTicket extends sequelize_1.Model {
}
SupportTicket.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    subject: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open'
    },
    priority: {
        type: sequelize_1.DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
    },
    assignedTo: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id'
        }
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
    tableName: 'support_tickets',
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['status'] },
        { fields: ['priority'] },
        { fields: ['assignedTo'] }
    ]
});
SupportTicket.belongsTo(User_model_1.default, { foreignKey: 'userId', as: 'user' });
SupportTicket.belongsTo(User_model_1.default, { foreignKey: 'assignedTo', as: 'assignee' });
User_model_1.default.hasMany(SupportTicket, { foreignKey: 'userId' });
User_model_1.default.hasMany(SupportTicket, { foreignKey: 'assignedTo', as: 'assignedTickets' });
exports.default = SupportTicket;
