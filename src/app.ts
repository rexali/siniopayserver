import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sequelize } from './config/db';

// Import routes
import userRoutes from './routes/User.routes'; // Add this
import profileRoutes from './routes/Profile.routes';
import accountRoutes from './routes/Account.routes';
import transactionRoutes from './routes/Transaction.routes';
import kycRoutes from './routes/KYCVerification.routes';
import linkedAccountRoutes from './routes/LinkedAccount.routes';
import notificationRoutes from './routes/Notification.routes';
import supportTicketRoutes from './routes/SupportTicket.routes';
import faqRoutes from './routes/FAQ.routes';
import auditLogRoutes from './routes/AuditLog.routes';
import complianceSettingRoutes from './routes/ComplianceSetting.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:8081", "https://hostel4students.vercel.app"],
  credentials: true,
  // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'] 
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Routes
app.use('/api/auth', userRoutes); // Add this - note the different base path
app.use('/api/profiles', profileRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/linked-accounts', linkedAccountRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/compliance', complianceSettingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API documentation
app.get('/api-docs', (req, res) => {
  res.json({
    name: 'Fintech API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      profiles: '/api/profiles',
      accounts: '/api/accounts',
      transactions: '/api/transactions',
      kyc: '/api/kyc',
      linkedAccounts: '/api/linked-accounts',
      notifications: '/api/notifications',
      supportTickets: '/api/support-tickets',
      faqs: '/api/faqs',
      auditLogs: '/api/audit-logs',
      compliance: '/api/compliance'
    },
    authentication: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      verifyEmail: 'POST /api/auth/verify-email',
      forgotPassword: 'POST /api/auth/forgot-password',
      resetPassword: 'POST /api/auth/reset-password'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: err.message 
    });
  }
  
  // Handle Sequelize errors
  if (err.name === 'SequelizeDatabaseError' || err.name === 'SequelizeValidationError') {
    return res.status(400).json({ 
      error: 'Database Error',
      details: err.message 
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Invalid Token',
      details: err.message 
    });
  }
  
  // Default error
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Database connection and server start
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Sync models
    const syncOptions: any = { 
      alter: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development', 
      // force: process.env.NODE_ENV === 'development' 
    };
    
    if (process.env.NODE_ENV === 'test') {
      syncOptions.force = true;
    }
    
    await sequelize.sync(syncOptions);
    console.log('Database synced');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Starting graceful shutdown...');
  await sequelize.close();
  console.log('Database connection closed.');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Starting graceful shutdown...');
  await sequelize.close();
  console.log('Database connection closed.');
  process.exit(0);
});

startServer();

export default app;