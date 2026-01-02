import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ForeignKey } from 'sequelize';
import { sequelize } from '../config/db';
import User from './User.model'; // Add this import

class Profile extends Model<InferAttributes<Profile>, InferCreationAttributes<Profile>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>; // Reference to User model
  declare phone: CreationOptional<string>;
  declare fullName: string;
  declare dateOfBirth: CreationOptional<Date>;
  declare address: CreationOptional<any>;
  declare avatarUrl: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare user?: User; // Add user relationship
}

Profile.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      is: /^[\+]?[1-9][0-9]{0,15}$/
    }
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  avatarUrl: {
    type: DataTypes.TEXT
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
  tableName: 'profiles',
  timestamps: true
});


export default Profile; 