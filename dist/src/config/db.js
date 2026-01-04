"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getSequelizeInstance() {
    let database;
    let username;
    let password;
    let host;
    let dialect;
    if (process.env.NODE_ENV !== "development") {
        database = process.env.PROD_DB_NAME, //config.database_prod;
            username = process.env.PROD_DB_USER, // config.username_prod;
            password = process.env.PROD_DB_PASS; // config.password_prod;
        host = process.env.PROD_DB_HOST; // config.host_prod;
        dialect = 'postgres'; // config.dialect_prod;
    }
    else {
        database = process.env.DB_NAME;
        username = process.env.DB_USER;
        password = process.env.DB_PASS;
        host = process.env.DB_HOST;
        dialect = 'postgres';
    }
    let sequelize = new sequelize_1.Sequelize(database, username, password, {
        host,
        dialect,
        pool: {
            max: 15,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
    return sequelize;
}
let sequelize = getSequelizeInstance();
exports.sequelize = sequelize;
