const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 */
router.get('/profile', authenticateToken, userController.getUserProfile);

/**
 * @route   PATCH /api/users/profile
 * @desc    Update current user's profile
 */
router.patch('/profile', authenticateToken, userController.updateUserProfile);

/**
 * @route   POST /api/users/change-password
 * @desc    Change current user's password
 */
router.post('/change-password', authenticateToken, userController.changePassword);

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 */
router.get('/', authenticateToken, authorizeRole('admin'), userController.getAllUsers);

/**
 * @route   PATCH /api/users/:userId/status
 * @desc    Update user status (admin only)
 */
router.patch('/:userId/status', authenticateToken, authorizeRole('admin'), userController.updateUserStatus);

/**
 * @route   GET /api/users/doctors
 * @desc    Get list of doctors (for patients)
 */
router.get('/doctors', authenticateToken, userController.getDoctors);

module.exports = router; 