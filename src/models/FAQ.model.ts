// import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, UUIDV4 } from 'sequelize';
// import { sequelize } from '../config/db';

// class Faq extends Model<InferAttributes<Faq>, InferCreationAttributes<Faq>> {
//     declare id: CreationOptional<string>;
//     declare question: string;
//     declare answer: string;
//     declare category: string;
//     declare order: number; // Display order
//     declare active: boolean;
//     declare createdAt?: CreationOptional<Date>;
//     declare updatedAt?: CreationOptional<Date>;
// }

// Faq.init({
//     id: { type: DataTypes.UUID, defaultValue: UUIDV4(), unique: true, primaryKey:true},
//     question: { type: DataTypes.TEXT, unique: true, allowNull: false },
//     answer: { type: DataTypes.TEXT, allowNull: false },
//     category: { type: DataTypes.TEXT, allowNull: false },
//     order: { type: DataTypes.INTEGER, allowNull: false },
//     active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue:'pending' }
// }, {
//     sequelize,
//     tableName: 'faqs',
//     timestamps: true,
// });

// export default Faq;

import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/db';

class FAQ extends Model<InferAttributes<FAQ>, InferCreationAttributes<FAQ>> {
  declare id: CreationOptional<string>;
  declare question: string;
  declare answer: string;
  declare category: string;
  declare orderIndex: CreationOptional<number>;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

FAQ.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'faqs',
  timestamps: true
});

export default FAQ;
