const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate user using JWT token
 * Extracts token from Authorization header and verifies it
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access token is required'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user by ID from token
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }
        
        if (!user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'User account is deactivated'
            });
        }
        
        // Attach user to request object
        req.user = user;
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token has expired'
            });
        }
        
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Authentication failed'
        });
    }
};

/**
 * Middleware to check if user has required role
 * @param {string|Array} roles - Required role(s) for access
 */
const authorizeRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }
            
            // Convert single role to array for easier handling
            const requiredRoles = Array.isArray(roles) ? roles : [roles];
            
            // Check if user has required role
            if (!requiredRoles.includes(req.user.role)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Insufficient permissions'
                });
            }
            
            next();
            
        } catch (error) {
            console.error('Role authorization error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Authorization failed'
            });
        }
    };
};

/**
 * Middleware to check if user is accessing their own resource
 * @param {string} paramName - Name of the parameter containing user ID
 */
const authorizeOwnResource = (paramName = 'userId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }
            
            const resourceUserId = req.params[paramName] || req.body[paramName];
            
            // Allow access if user is admin or accessing their own resource
            if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
                return next();
            }
            
            return res.status(403).json({
                status: 'error',
                message: 'Access denied to this resource'
            });
            
        } catch (error) {
            console.error('Resource authorization error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Authorization failed'
            });
        }
    };
};

/**
 * Optional authentication middleware
 * Similar to authenticateToken but doesn't fail if no token is provided
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return next(); // Continue without authentication
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
            req.user = user;
        }
        
        next();
        
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

module.exports = {
    authenticateToken,
    authorizeRole,
    authorizeOwnResource,
    optionalAuth
}; 