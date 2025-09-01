const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./database/init');

// Import routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointmentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const productRoutes = require('./routes/productRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/users');

// Import authentication middleware
const { authenticateToken, requireRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:8080'] // Add production frontend URL here
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:8080'], // Development frontend URL
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/patients', authenticateToken, patientRoutes);
app.use('/api/invoices', authenticateToken, invoiceRoutes);
app.use('/api/services', authenticateToken, serviceRoutes);
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/users', authenticateToken, userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await database.init();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`SmileSync Backend Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Graceful shutdown...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

module.exports = app;