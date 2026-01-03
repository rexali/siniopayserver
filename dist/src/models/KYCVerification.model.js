"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const User_model_1 = __importDefault(require("./User.model"));
class KYCVerification extends sequelize_1.Model {
}
KYCVerification.init({
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
    verificationType: {
        type: sequelize_1.DataTypes.ENUM('identity', 'address', 'document'),
        defaultValue: 'identity'
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected', 'under_review'),
        defaultValue: 'pending'
    },
    documents: {
        type: sequelize_1.DataTypes.JSONB,
        defaultValue: []
    },
    verifiedBy: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'profiles',
            key: 'id'
        }
    },
    verifiedAt: {
        type: sequelize_1.DataTypes.DATE
    },
    rejectionReason: {
        type: sequelize_1.DataTypes.TEXT
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
    tableName: 'kyc_verifications',
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['status'] },
        { fields: ['createdAt'] }
    ]
});
KYCVerification.belongsTo(User_model_1.default, { foreignKey: 'userId', as: 'user' });
KYCVerification.belongsTo(User_model_1.default, { foreignKey: 'verifiedBy', as: 'verifier' });
User_model_1.default.hasMany(KYCVerification, { foreignKey: 'userId' });
exports.default = KYCVerification;
