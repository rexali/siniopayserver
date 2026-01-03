"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
// Import routes
const User_routes_1 = __importDefault(require("./routes/User.routes")); // Add this
const Profile_routes_1 = __importDefault(require("./routes/Profile.routes"));
const Account_routes_1 = __importDefault(require("./routes/Account.routes"));
const Transaction_routes_1 = __importDefault(require("./routes/Transaction.routes"));
const KYCVerification_routes_1 = __importDefault(require("./routes/KYCVerification.routes"));
const LinkedAccount_routes_1 = __importDefault(require("./routes/LinkedAccount.routes"));
const Notification_routes_1 = __importDefault(require("./routes/Notification.routes"));
const SupportTicket_routes_1 = __importDefault(require("./routes/SupportTicket.routes"));
const FAQ_routes_1 = __importDefault(require("./routes/FAQ.routes"));
const AuditLog_routes_1 = __importDefault(require("./routes/AuditLog.routes"));
const ComplianceSetting_routes_1 = __importDefault(require("./routes/ComplianceSetting.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:8081", "https://hostel4students.vercel.app"],
    credentials: true,
    // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'] 
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
// Routes
app.use('/api/auth', User_routes_1.default); // Add this - note the different base path
app.use('/api/profiles', Profile_routes_1.default);
app.use('/api/accounts', Account_routes_1.default);
app.use('/api/transactions', Transaction_routes_1.default);
app.use('/api/kyc', KYCVerification_routes_1.default);
app.use('/api/linked-accounts', LinkedAccount_routes_1.default);
app.use('/api/notifications', Notification_routes_1.default);
app.use('/api/support-tickets', SupportTicket_routes_1.default);
app.use('/api/faqs', FAQ_routes_1.default);
app.use('/api/audit-logs', AuditLog_routes_1.default);
app.use('/api/compliance', ComplianceSetting_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});
const verifyToken = process.env.VERIFY_TOKEN;
// Route for GET requests
app.get('/', (req, res) => {
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
    if (mode === 'subscribe' && token === verifyToken) {
        console.log('WEBHOOK VERIFIED');
        res.status(200).send(challenge);
    }
    else {
        res.status(403).end();
    }
});
// Route for POST requests
app.post('/', (req, res) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    console.log(`\n\nWebhook received ${timestamp}\n`);
    console.log(JSON.stringify(req.body, null, 2));
    res.status(200).end();
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
app.use((err, req, res, next) => {
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
        await db_1.sequelize.authenticate();
        console.log('Database connected successfully');
        // Sync models
        const syncOptions = {
            alter: process.env.NODE_ENV === 'development',
            logging: process.env.NODE_ENV === 'development',
            // force: process.env.NODE_ENV === 'development' 
        };
        if (process.env.NODE_ENV === 'test') {
            syncOptions.force = true;
        }
        await db_1.sequelize.sync(syncOptions);
        console.log('Database synced');
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
        });
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
        server.keepAliveTimeout = 120 * 1000;
        server.headersTimeout = 120 * 1000;
    }
    catch (error) {
        console.error('Unable to connect to database:', error);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Starting graceful shutdown...');
    await db_1.sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Starting graceful shutdown...');
    await db_1.sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
});
startServer();
exports.default = app;
