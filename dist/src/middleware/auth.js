"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireReauthentication = exports.require2FA = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Verify user exists and is active
        const user = await User_model_1.default.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found.' });
        }
        // if (user.status !== 'active') {
        //   return res.status(403).json({ 
        //     error: 'Account is not active.',
        //     status: user.status 
        //   });
        // }
        // Check if email is verified
        // if (!user.emailVerifiedAt) {
        //   return res.status(403).json({ 
        //     error: 'Email not verified. Please verify your email to continue.',
        //     needsVerification: true 
        //   });
        // }
        // Check if password was changed after token was issued
        if (user.passwordChangedAt) {
            const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
            if (user.passwordChangedAt.getTime() > tokenIssuedAt) {
                return res.status(401).json({ error: 'Password was changed. Please login again.' });
            }
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            twoFactorAuthentication: user.twoFactorAuthentication
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        res.status(400).json({ error: 'Authentication failed.' });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({
                error: 'Access denied. Insufficient permissions.',
                requiredRoles: roles,
                userRole
            });
        }
        next();
    };
};
exports.authorize = authorize;
// Middleware to check 2FA status
const require2FA = async (req, res, next) => {
    const userId = req.user?.id;
    try {
        const user = await User_model_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.twoFactorAuthentication) {
            // Check if 2FA was verified in this session
            // This would typically check a session variable or a short-lived token
            const twoFactorVerified = req.headers['x-2fa-verified'] === 'true';
            if (!twoFactorVerified) {
                return res.status(403).json({
                    error: 'Two-factor authentication required',
                    requires2FA: true
                });
            }
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to check 2FA status' });
    }
};
exports.require2FA = require2FA;
// Middleware for sensitive operations (requires re-authentication)
const requireReauthentication = async (req, res, next) => {
    const password = req.headers['x-reauth-password'];
    if (!password) {
        return res.status(401).json({
            error: 'Re-authentication required',
            requiresPassword: true
        });
    }
    const userId = req.user?.id;
    try {
        const user = await User_model_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Re-authentication failed' });
    }
};
exports.requireReauthentication = requireReauthentication;
