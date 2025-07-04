const User = require('../models/User');

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id;
        
        // Check if user is accessing their own profile or is admin
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }
        
        const user = await User.findById(userId).select('-password');
        
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
        console.error('Get user profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user profile'
        });
    }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id;
        const { name, phone, specialization } = req.body;
        
        // Check if user is updating their own profile or is admin
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }
        
        // Update allowed fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (specialization) user.specialization = specialization;
        
        await user.save();
        
        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                user: user.getProfile()
            }
        });
        
    } catch (error) {
        console.error('Update user profile error:', error);
        
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
            message: 'Failed to update profile'
        });
    }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Current password and new password are required'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                status: 'error',
                message: 'New password must be at least 6 characters long'
            });
        }
        
        // Find user with password
        const user = await User.findById(userId).select('+password');
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }
        
        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to change password'
        });
    }
};

/**
 * Get all users (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
    try {
        const { role, limit = 20, page = 1 } = req.query;
        
        // Build filter
        let filter = {};
        if (role && ['patient', 'doctor', 'admin'].includes(role)) {
            filter.role = role;
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get users
        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        
        // Get total count
        const totalUsers = await User.countDocuments(filter);
        
        res.status(200).json({
            status: 'success',
            data: {
                users: users.map(user => user.getProfile()),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalUsers / parseInt(limit)),
                    totalUsers,
                    hasNextPage: skip + users.length < totalUsers,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch users'
        });
    }
};

/**
 * Update user status (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        
        // Only admin can update user status
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }
        
        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot deactivate your own account'
            });
        }
        
        user.isActive = isActive;
        await user.save();
        
        res.status(200).json({
            status: 'success',
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                user: user.getProfile()
            }
        });
        
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user status'
        });
    }
};

/**
 * Get doctors list (for patients to book appointments)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDoctors = async (req, res) => {
    try {
        const { specialization } = req.query;
        
        // Build filter
        let filter = { role: 'doctor', isActive: true };
        if (specialization) {
            filter.specialization = { $regex: specialization, $options: 'i' };
        }
        
        const doctors = await User.find(filter)
            .select('name email phone specialization')
            .sort({ name: 1 });
        
        res.status(200).json({
            status: 'success',
            data: {
                doctors
            }
        });
        
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch doctors'
        });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getAllUsers,
    updateUserStatus,
    getDoctors
}; 