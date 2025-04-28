// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes'; // Route untuk User
import adminAuthRoutes from './routes/adminAuthRoutes'; // Route untuk Admin
import adminRoutes from './routes/adminRoutes'; // Route lainnya untuk Admin (jika ada)
import transportRoutes from './routes/transportRoutes';
import roomRoutes from './routes/roomRoutes';
import transportBookingRoutes from './routes/transportBookingRoutes';
import roomBookingRoutes from './routes/roomBookingRoutes';
import { initModels } from './models';
import sequelize from './config/db';
import { adminAuthMiddleware } from './middlewares/adminAuthMiddleware';
import userRoutes from './routes/userRoutes';
 
dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());
 
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
initModels();

// Sinkronisasi database
sequelize.sync({ force: false }) // Ganti ke true jika ingin reset tabel
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch((error) => {
    console.error('Error creating database:', error);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); // Routes untuk User
app.use('/api/admins/auth', adminAuthRoutes); // Routes untuk Admin Auth
app.use('/api/admins', adminAuthMiddleware, adminRoutes); // Routes lainnya untuk Admin, dilindungi oleh middleware
app.use('/api/transports', transportRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/transport-bookings', transportBookingRoutes);
app.use('/api/room-bookings', roomBookingRoutes);


app.get('/', (req, res) => {
  res.send('API is running');
});

export default app;
 