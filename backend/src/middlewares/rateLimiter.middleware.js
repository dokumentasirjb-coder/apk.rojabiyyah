import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 300, // High limit in development to prevent blocking during active testing
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDev && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'),
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi beberapa saat lagi.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 30, // Limit each IP to 500 requests in dev, 30 in prod
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDev && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'),
  message: {
    success: false,
    message: 'Terlalu banyak percobaan autentikasi. Demi keamanan, silakan coba lagi setelah 15 menit.',
  },
});

