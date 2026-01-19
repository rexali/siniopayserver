"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Profile_model_1 = __importDefault(require("./Profile.model"));
class User extends sequelize_1.Model {
    // Instance methods
    async comparePassword(candidatePassword) {
        return bcrypt_1.default.compare(candidatePassword, this.password);
    }
    async updatePassword(newPassword) {
        this.password = await bcrypt_1.default.hash(newPassword, 12);
        this.passwordChangedAt = new Date();
        await this.save();
    }
    isActive() {
        return this.status === 'active';
    }
    isEmailVerified() {
        return !!this.emailVerifiedAt;
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('customer', 'admin', 'super_admin'),
        defaultValue: 'customer'
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'active', 'suspended', 'blocked'),
        defaultValue: 'pending'
    },
    confirmationCode: {
        type: sequelize_1.DataTypes.STRING
    },
    twoFactorAuthentication: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastLoginAt: {
        type: sequelize_1.DataTypes.DATE
    },
    passwordChangedAt: {
        type: sequelize_1.DataTypes.DATE
    },
    emailVerifiedAt: {
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
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt_1.default.hash(user.password, 12);
            }
            // Generate confirmation code for email verification
            if (!user.confirmationCode) {
                user.confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt_1.default.hash(user.password, 12);
                user.passwordChangedAt = new Date();
            }
        }
    }
});
// Set up associations
User.hasOne(Profile_model_1.default, { foreignKey: 'userId', as: 'profile' });
Profile_model_1.default.belongsTo(User, { foreignKey: 'userId', as: 'user' });
exports.default = User;
