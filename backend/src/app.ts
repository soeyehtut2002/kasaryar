import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import shopRoutes from './routes/shopRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/error';
import { AppError } from './utils/appError';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', shopRoutes);
app.use('/api/admin', adminRoutes);

// Unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
