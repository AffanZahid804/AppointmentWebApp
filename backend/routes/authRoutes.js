const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post('/register', authController.registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT
 */
router.post('/login', authController.loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile (protected)
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token (protected)
 */
router.post('/refresh', authenticateToken, authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 */
router.post('/logout', authenticateToken, authController.logoutUser);

module.exports = router; 