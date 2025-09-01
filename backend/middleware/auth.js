const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT Secret (should match the one in auth routes)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request object
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if user still exists and is active
        const user = await User.findById(decoded.userId);
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Add user info to request object
        req.user = {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullUser: user
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has required role(s)
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

/**
 * Permission-based authorization middleware
 * Checks if user has specific permission
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = req.user.fullUser;
        if (!user.hasPermission(permission)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

/**
 * Optional authentication middleware
 * Adds user info if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId);
            
            if (user && user.is_active) {
                req.user = {
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    fullUser: user
                };
            }
        }

        next();
    } catch (error) {
        // Ignore token errors for optional auth
        next();
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    requirePermission,
    optionalAuth
};