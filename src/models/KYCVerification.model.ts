import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ForeignKey } from 'sequelize';
import { sequelize } from '../config/db';
import User from './User.model';

class KYCVerification extends Model<InferAttributes<KYCVerification>, InferCreationAttributes<KYCVerification>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>;
  declare verificationType: string;
  declare status: CreationOptional<string>;
  declare documents: CreationOptional<any[]>;
  declare verifiedBy: CreationOptional<ForeignKey<string>>;
  declare verifiedAt: CreationOptional<Date>;
  declare rejectionReason: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  
  // Virtual getters
  declare user?: any;
  declare verifier?: any;
}

KYCVerification.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'profiles',
      key: 'id'
    }
  },
  verificationType: {
    type: DataTypes.ENUM('identity', 'address', 'document'),
    defaultValue: 'identity'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'under_review'),
    defaultValue: 'pending'
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  verifiedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'profiles',
      key: 'id'
    }
  },
  verifiedAt: {
    type: DataTypes.DATE
  },
  rejectionReason: {
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
  tableName: 'kyc_verifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

KYCVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
KYCVerification.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });
User.hasMany(KYCVerification, { foreignKey: 'userId' });

export default KYCVerification;