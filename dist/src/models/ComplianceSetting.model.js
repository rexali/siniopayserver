"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class ComplianceSetting extends sequelize_1.Model {
}
ComplianceSetting.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    settingType: {
        type: sequelize_1.DataTypes.ENUM('transaction_limit', 'aml_rule', 'security_policy'),
        allowNull: false
    },
    settingKey: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    settingValue: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false
    },
    active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
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
    tableName: 'compliance_settings',
    timestamps: true
});
exports.default = ComplianceSetting;
