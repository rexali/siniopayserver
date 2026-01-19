"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Profile extends sequelize_1.Model {
}
Profile.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            is: /^[\+]?[1-9][0-9]{0,15}$/
        }
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    middleName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    nin: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    bvn: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    dateOfBirth: {
        type: sequelize_1.DataTypes.DATEONLY
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    avatarUrl: {
        type: sequelize_1.DataTypes.TEXT
    },
    ninUrl: {
        type: sequelize_1.DataTypes.TEXT
    },
    addressUrl: {
        type: sequelize_1.DataTypes.TEXT
    },
    localGovt: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'profiles',
    timestamps: true
});
exports.default = Profile;
