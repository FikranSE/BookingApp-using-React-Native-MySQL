// backend/src/app.ts

import express, { Application } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Application = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rute
app.use('/api/auth', authRoutes);

// Rute default
app.get('/', (req, res) => {
  res.send('API is running');
});

export default app;
