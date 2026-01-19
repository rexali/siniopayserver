import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import User from './User.model';

class Device extends Model<InferAttributes<Device>, InferCreationAttributes<Device>> {
    declare id: CreationOptional<string>;
    declare userId: string;
    declare deviceId: string;
    declare deviceName: CreationOptional<string>;
    declare ipAddress: CreationOptional<string>;
    declare lastUsed: CreationOptional<Date>;
    declare trusted: CreationOptional<boolean>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Device.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    deviceId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deviceName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastUsed: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    trusted: {
        type: DataTypes.STRING
    },

    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    tableName: 'devices',
    timestamps: true,
});


// Set up associations
User.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'userId', as: 'user' });


export default Device;
