// app.config.js

import 'dotenv/config';

export default ({ config }) => {
  const ENV = process.env.APP_ENV || 'development';

  const envConfig = {
    development: {
      BASE_URL: process.env.BASE_URL_DEVELOPMENT || 'http://192.168.1.100:3000/api',
    },
    production: {
      BASE_URL: process.env.BASE_URL_PRODUCTION || 'https://e01c-103-212-43-216.ngrok-free.app/api',
    },
    // Tambahkan environment lain jika diperlukan
  };

  return {
    ...config,
    extra: {
      BASE_URL: envConfig[ENV].BASE_URL,
      // Tambahkan variabel lain jika diperlukan
    },
  };
};
