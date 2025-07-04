const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id,
            email: user.email,
            role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone, specialization } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }
        
        // Create new user
        const user = new User({
            name,
            email,
            password,
            role: role || 'patient',
            phone,
            specialization
        });
        
        await user.save();
        
        // Generate token
        const token = generateToken(user);
        
        // Return user profile and token
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: user.getProfile(),
                token
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors
            });
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Registration failed'
        });
    }
};

/**
 * Login user with email and password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }
        
        // Find user by email and include password for comparison
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }
        
        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'Account is deactivated'
            });
        }
        
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }
        
        // Generate token
        const token = generateToken(user);
        
        // Return user profile and token
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: user.getProfile(),
                token
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed'
        });
    }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                user: user.getProfile()
            }
        });
        
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get user profile'
        });
    }
};

/**
 * Refresh user token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found or inactive'
            });
        }
        
        // Generate new token
        const token = generateToken(user);
        
        res.status(200).json({
            status: 'success',
            message: 'Token refreshed successfully',
            data: {
                token
            }
        });
        
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Token refresh failed'
        });
    }
};

/**
 * Logout user (client-side token removal)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logoutUser = async (req, res) => {
    try {
        // In a stateless JWT system, logout is handled client-side
        // This endpoint can be used for logging purposes
        res.status(200).json({
            status: 'success',
            message: 'Logout successful'
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Logout failed'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    refreshToken,
    logoutUser
}; 