
import { Sequelize, } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

function getSequelizeInstance(){

    let database:string;
    let username:string;
    let password:string; 
    let host:string;
    let dialect:any;

       if (process.env.NODE_ENV !== "development") {
        database =process.env.PROD_DB_NAME as string, //config.database_prod;
        username = process.env.PROD_DB_USER as string, // config.username_prod;
        password = process.env.PROD_DB_PASS as string; // config.password_prod;
        host = process.env.PROD_DB_HOST as string; // config.host_prod;
        dialect = 'postgres' as any; // config.dialect_prod;
    } else {
        database = process.env.DB_NAME as string;
        username = process.env.DB_USER as string;
        password = process.env.DB_PASS as string;
        host = process.env.DB_HOST as string
        dialect = 'postgres' as any;
    }

    let sequelize = new Sequelize(
        database,
        username,
        password,
        {
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

export { sequelize };
