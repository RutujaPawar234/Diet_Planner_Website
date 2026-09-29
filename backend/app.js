import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

// Render / Railway sit behind a proxy — needed for correct client IPs in rate limiting.
app.set('trust proxy', 1);

// ---------- Global middleware ----------
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin tools (curl, Postman) that send no Origin header.
      if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '100kb' }));
if (!env.isTest) app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// ---------- Routes ----------
app.get('/', (_req, res) => res.json({ name: 'NutriPlan API', docs: '/api/health' }));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    environment: env.nodeEnv,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  });
});

app.use('/api', apiRoutes);

// ---------- Errors ----------
app.use(notFound);
app.use(errorHandler);

export default app;
