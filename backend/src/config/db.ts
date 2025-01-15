// backend/src/config/db.ts

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'bookingsisi',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306, 
    dialect: process.env.DB_DIALECT as any || 'mysql', 
    logging: false,
  } 
);

export default sequelize;
