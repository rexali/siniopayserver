"use strict";
// import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, UUIDV4 } from 'sequelize';
// import { sequelize } from '../config/db';
Object.defineProperty(exports, "__esModule", { value: true });
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
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class FAQ extends sequelize_1.Model {
}
FAQ.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    question: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    answer: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    orderIndex: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0
    },
    active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
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
    tableName: 'faqs',
    timestamps: true
});
exports.default = FAQ;
