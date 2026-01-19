import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ForeignKey } from 'sequelize';
import { sequelize } from '../config/db';
import User from './User.model'; // Add this import

class Profile extends Model<InferAttributes<Profile>, InferCreationAttributes<Profile>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>; // Reference to User model
  declare phone: CreationOptional<string>;
  declare fullName: string;
  declare firstName: CreationOptional<string>;
  declare lastName: CreationOptional<string>;
  declare middleName: CreationOptional<string>;
  declare nin: CreationOptional<string>;
  declare bvn: CreationOptional<string>;
  declare dateOfBirth: CreationOptional<Date>;
  declare address: CreationOptional<string>;
  declare avatarUrl: CreationOptional<string>;
  declare ninUrl: CreationOptional<string>;
  declare addressUrl: CreationOptional<string>;
  declare localGovt: CreationOptional<string>;
  declare state: CreationOptional<string>;
  declare country: CreationOptional<string>;
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
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bvn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatarUrl: {
    type: DataTypes.TEXT
  },
  ninUrl: {
    type: DataTypes.TEXT
  },
  addressUrl: {
    type: DataTypes.TEXT
  },
  localGovt: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

}, {
  sequelize,
  tableName: 'profiles',
  timestamps: true
});


export default Profile; 