"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const User_model_1 = __importDefault(require("./User.model"));
class Notification extends sequelize_1.Model {
}
Notification.init({
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
    targetUserId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('transaction', 'reminder', 'alert', 'system'),
        allowNull: false
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    read: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        defaultValue: {}
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: db_1.sequelize,
    tableName: 'notifications',
    timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ['userId'] },
        { fields: ['read'] },
        { fields: ['createdAt'] }
    ]
});
Notification.belongsTo(User_model_1.default, { foreignKey: 'userId', as: 'user' });
User_model_1.default.hasMany(Notification, { foreignKey: 'userId', as: "notifications" });
exports.default = Notification;
