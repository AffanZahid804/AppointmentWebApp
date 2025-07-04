const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment (patient only)
 */
router.post('/', authenticateToken, authorizeRole('patient'), appointmentController.createAppointment);

/**
 * @route   GET /api/appointments
 * @desc    Get appointments for current user (patient/doctor/admin)
 */
router.get('/', authenticateToken, appointmentController.getAppointments);

/**
 * @route   GET /api/appointments/:appointmentId
 * @desc    Get appointment by ID (protected)
 */
router.get('/:appointmentId', authenticateToken, appointmentController.getAppointmentById);

/**
 * @route   PATCH /api/appointments/:appointmentId/status
 * @desc    Update appointment status (patient/doctor/admin)
 */
router.patch('/:appointmentId/status', authenticateToken, appointmentController.updateAppointmentStatus);

/**
 * @route   POST /api/appointments/:appointmentId/cancel
 * @desc    Cancel appointment (patient/doctor/admin)
 */
router.post('/:appointmentId/cancel', authenticateToken, appointmentController.cancelAppointment);

/**
 * @route   GET /api/appointments/doctors
 * @desc    Get available doctors (for booking)
 */
router.get('/doctors/list', authenticateToken, appointmentController.getAvailableDoctors);

module.exports = router; 