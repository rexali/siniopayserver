"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const User_model_1 = __importDefault(require("./User.model"));
class Device extends sequelize_1.Model {
}
Device.init({
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
    deviceId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    deviceName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    lastUsed: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    trusted: {
        type: sequelize_1.DataTypes.STRING
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
    tableName: 'devices',
    timestamps: true,
});
// Set up associations
User_model_1.default.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
Device.belongsTo(User_model_1.default, { foreignKey: 'userId', as: 'user' });
exports.default = Device;
