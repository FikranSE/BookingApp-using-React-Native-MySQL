import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import adminAuthRoutes from './routes/adminAuthRoutes';
import adminRoutes from './routes/adminRoutes';
import transportRoutes from './routes/transportRoutes';
import roomRoutes from './routes/roomRoutes';
import transportBookingRoutes from './routes/transportBookingRoutes';
import roomBookingRoutes from './routes/roomBookingRoutes';
import userRoutes from './routes/userRoutes';
import { initModels } from './models';
import sequelize from './config/db';
import { adminAuthMiddleware } from './middlewares/adminAuthMiddleware';
import { errorHandler } from './middlewares/errorHandler'; // Import error handler
import { Expo } from 'expo-server-sdk';
dotenv.config();
import * as FirebaseService from './FirebaseService';
const app: Application = express();

const expo = new Expo();
const jsonParser = bodyParser.json();
const httpParser = bodyParser.urlencoded({ extended: false });

app.post("/registerPushToken", jsonParser, async (req, res) => {
  const userId = String(req.body.userId);
  const token = String(req.body.token);
  await FirebaseService.saveToken(userId, token);
  res.status(200).send("success");
});

app.post(`/sample`, async (_, res) => {
  const {token} = await FirebaseService.getToken("0001");
  expo.sendPushNotificationsAsync([
    {
    to: token,
    title: "Sinergi Informatika SI",
    body: "Your Booking Has Been Confirmed",
   },
  ]);
  res.status(200).send("success");
});

 
// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static directories
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Pastikan direktori uploads ada
import fs from 'fs';
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Initialisasi models
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

// Error handler middleware (Tempatkan ini sebagai middleware terakhir)
app.use(errorHandler);
 
export default app;