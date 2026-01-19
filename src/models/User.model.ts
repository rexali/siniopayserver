import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import bcrypt from 'bcrypt';
import Profile from './Profile.model';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare password: string;
  declare role: CreationOptional<string>;
  declare status: CreationOptional<string>;
  declare confirmationCode: CreationOptional<string>;
  declare twoFactorAuthentication: CreationOptional<boolean>;
  declare lastLoginAt: CreationOptional<Date>;
  declare passwordChangedAt: CreationOptional<Date>;
  declare emailVerifiedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare profile?: CreationOptional<any>;
  declare accounts?: CreationOptional<any>;


  // Instance methods
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  async updatePassword(newPassword: string): Promise<void> {
    this.password = await bcrypt.hash(newPassword, 12);
    this.passwordChangedAt = new Date();
    await this.save();
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin', 'super_admin'),
    defaultValue: 'customer'
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'suspended', 'blocked'),
    defaultValue: 'pending'
  },
  confirmationCode: {
    type: DataTypes.STRING
  },
  twoFactorAuthentication: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLoginAt: {
    type: DataTypes.DATE
  },
  passwordChangedAt: {
    type: DataTypes.DATE
  },
  emailVerifiedAt: {
    type: DataTypes.DATE
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
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user: User) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
      // Generate confirmation code for email verification
      if (!user.confirmationCode) {
        user.confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
      }
    },
    beforeUpdate: async (user: User) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
        user.passwordChangedAt = new Date();
      }
    }
  }
});


// Set up associations
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'userId', as: 'user' });


export default User;
