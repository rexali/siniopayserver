"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const User_model_1 = __importDefault(require("./User.model"));
class AuditLog extends sequelize_1.Model {
}
AuditLog.init({
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
    action: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    resourceType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    resourceId: {
        type: sequelize_1.DataTypes.UUID
    },
    details: {
        type: sequelize_1.DataTypes.JSONB,
        defaultValue: {}
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: db_1.sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ['userId'] },
        { fields: ['resourceType', 'resourceId'] },
        { fields: ['createdAt'] }
    ]
});
AuditLog.belongsTo(User_model_1.default, { foreignKey: 'userId', as: 'user' });
User_model_1.default.hasMany(AuditLog, { foreignKey: 'userId' });
exports.default = AuditLog;
