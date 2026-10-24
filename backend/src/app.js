import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import memberRoutes from './routes/member.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import { loanRouter, loanRequestRouter } from './routes/loan.routes.js';
import institutionRoutes from './routes/institution.routes.js';
import regionRoutes from './routes/region.routes.js';
import { taskPointRouter, fieldReportRouter } from './routes/regionControl.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminUserRoutes from './routes/adminUser.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow loading uploaded media from frontend
  })
);

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://192.168.0.108:5173',
  'http://192.168.0.108:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Akses diblokir oleh kebijakan CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Static Files (Uploaded Media)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Direct PRD Word Download
app.get('/download-prd', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/PRD_SISTEM_ADMINISTRASI_ROJABIYYAH_2026.docx');
  res.download(filePath, 'PRD_SISTEM_ADMINISTRASI_ROJABIYYAH_2026.docx');
});

// Global Rate Limiter
app.use('/api', globalLimiter);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Dokumentasi API Administrasi Rojabiyyaah',
}));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    app: 'Administrasi Rojabiyyaah API',
    version: '1.0.0',
  });
});

// API Routes Mounting (Prefix: /api/v1)
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/members`, memberRoutes);
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
app.use(`${API_PREFIX}/loans`, loanRouter);
app.use(`${API_PREFIX}/loan-requests`, loanRequestRouter);
app.use(`${API_PREFIX}/institutions`, institutionRoutes);
app.use(`${API_PREFIX}/regions`, regionRoutes);
app.use(`${API_PREFIX}/task-points`, taskPointRouter);
app.use(`${API_PREFIX}/field-reports`, fieldReportRouter);
app.use(`${API_PREFIX}/transactions`, transactionRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/settings`, settingsRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/admin-users`, adminUserRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rute '${req.originalUrl}' tidak ditemukan pada server ini`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
