
// import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';
// dotenv.config();

// const connectionString = process.env.DATABASE_URL as string;
// export const sequelize = new Sequelize(connectionString, {
//   dialect: 'postgres',
//   logging: false,
// });

// export default sequelize;

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fintech',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'rexali',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export { sequelize };
