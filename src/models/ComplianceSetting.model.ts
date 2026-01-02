import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/db';

class ComplianceSetting extends Model<InferAttributes<ComplianceSetting>, InferCreationAttributes<ComplianceSetting>> {
  declare id: CreationOptional<string>;
  declare settingType: string;
  declare settingKey: string;
  declare settingValue: any;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ComplianceSetting.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  settingType: {
    type: DataTypes.ENUM('transaction_limit', 'aml_rule', 'security_policy'),
    allowNull: false
  },
  settingKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  settingValue: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'compliance_settings',
  timestamps: true
});

export default ComplianceSetting;
