// backend/src/server.ts

import app from './app';
import sequelize from './config/db';
import { startScheduler } from './scheduler';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Cek koneksi database
    await sequelize.authenticate();
    console.log('Koneksi ke database berhasil');

    // Sinkronisasi model (hanya untuk pengembangan; gunakan migrasi untuk produksi)
    await sequelize.sync({ alter: false });
    console.log('Model disinkronkan');

    // Jalankan server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Start the reminder scheduler
      startScheduler();
    });
  } catch (error) {
    console.error('Gagal menghubungkan ke database:', error);
    process.exit(1);
  } 
};

startServer();
  