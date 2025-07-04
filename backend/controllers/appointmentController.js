const Appointment = require('../models/Appointment');
const User = require('../models/User');

/**
 * Create a new appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, notes, symptoms, duration, isUrgent } = req.body;
        const patientId = req.user._id;
        
        // Validate required fields
        if (!doctorId || !date || !time) {
            return res.status(400).json({
                status: 'error',
                message: 'Doctor ID, date, and time are required'
            });
        }
        
        // Check if doctor exists and is active
        const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
        
        if (!doctor) {
            return res.status(404).json({
                status: 'error',
                message: 'Doctor not found or inactive'
            });
        }
        
        // Validate appointment date is not in the past
        const appointmentDate = new Date(date);
        if (appointmentDate <= new Date()) {
            return res.status(400).json({
                status: 'error',
                message: 'Appointment date cannot be in the past'
            });
        }
        
        // Create appointment
        const appointment = new Appointment({
            patientId,
            doctorId,
            date: appointmentDate,
            time,
            notes,
            symptoms,
            duration: duration || 30,
            isUrgent: isUrgent || false
        });
        
        await appointment.save();
        
        // Populate user data for response
        await appointment.populate('patientId', 'name email phone');
        await appointment.populate('doctorId', 'name email phone specialization');
        
        res.status(201).json({
            status: 'success',
            message: 'Appointment created successfully',
            data: {
                appointment: appointment.getDisplayDetails(),
                patient: appointment.patientId,
                doctor: appointment.doctorId
            }
        });
        
    } catch (error) {
        console.error('Create appointment error:', error);
        
        if (error.message === 'Appointment slot is already booked') {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
        
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
            message: 'Failed to create appointment'
        });
    }
};

/**
 * Get appointments based on user role and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAppointments = async (req, res) => {
    try {
        const { status, date, limit = 20, page = 1 } = req.query;
        const userId = req.user._id;
        const userRole = req.user.role;
        
        // Build filter based on user role
        let filter = {};
        
        if (userRole === 'patient') {
            filter.patientId = userId;
        } else if (userRole === 'doctor') {
            filter.doctorId = userId;
        }
        // Admin can see all appointments
        
        // Add status filter
        if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            filter.status = status;
        }
        
        // Add date filter
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            filter.date = {
                $gte: startDate,
                $lt: endDate
            };
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get appointments with populated user data
        const appointments = await Appointment.getAppointmentsWithUsers(filter, {
            limit: parseInt(limit),
            skip
        });
        
        // Get total count for pagination
        const totalAppointments = await Appointment.countDocuments(filter);
        
        res.status(200).json({
            status: 'success',
            data: {
                appointments: appointments.map(apt => ({
                    ...apt.getDisplayDetails(),
                    patient: apt.patientId,
                    doctor: apt.doctorId
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalAppointments / parseInt(limit)),
                    totalAppointments,
                    hasNextPage: skip + appointments.length < totalAppointments,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch appointments'
        });
    }
};

/**
 * Get a specific appointment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAppointmentById = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;
        
        // Build filter based on user role
        let filter = { _id: appointmentId };
        
        if (userRole === 'patient') {
            filter.patientId = userId;
        } else if (userRole === 'doctor') {
            filter.doctorId = userId;
        }
        // Admin can access any appointment
        
        const appointment = await Appointment.findOne(filter)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name email phone specialization');
        
        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                appointment: {
                    ...appointment.getDisplayDetails(),
                    patient: appointment.patientId,
                    doctor: appointment.doctorId
                }
            }
        });
        
    } catch (error) {
        console.error('Get appointment by ID error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch appointment'
        });
    }
};

/**
 * Update appointment status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;
        const userId = req.user._id;
        const userRole = req.user.role;
        
        // Validate status
        if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status value'
            });
        }
        
        // Find appointment
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found'
            });
        }
        
        // Check permissions
        if (userRole === 'patient' && appointment.patientId.toString() !== userId.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }
        
        if (userRole === 'doctor' && appointment.doctorId.toString() !== userId.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }
        
        // Update status
        appointment.status = status;
        await appointment.save();
        
        // Populate user data for response
        await appointment.populate('patientId', 'name email phone');
        await appointment.populate('doctorId', 'name email phone specialization');
        
        res.status(200).json({
            status: 'success',
            message: 'Appointment status updated successfully',
            data: {
                appointment: {
                    ...appointment.getDisplayDetails(),
                    patient: appointment.patientId,
                    doctor: appointment.doctorId
                }
            }
        });
        
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update appointment status'
        });
    }
};

/**
 * Cancel appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;
        
        // Find appointment
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found'
            });
        }
        
        // Check permissions
        if (userRole === 'patient' && appointment.patientId.toString() !== userId.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }
        
        if (userRole === 'doctor' && appointment.doctorId.toString() !== userId.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }
        
        // Check if appointment can be cancelled
        if (!appointment.canBeCancelled()) {
            return res.status(400).json({
                status: 'error',
                message: 'Appointment cannot be cancelled (less than 2 hours away)'
            });
        }
        
        // Update status to cancelled
        appointment.status = 'cancelled';
        await appointment.save();
        
        res.status(200).json({
            status: 'success',
            message: 'Appointment cancelled successfully'
        });
        
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to cancel appointment'
        });
    }
};

/**
 * Get available doctors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAvailableDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ 
            role: 'doctor', 
            isActive: true 
        }).select('name email phone specialization');
        
        res.status(200).json({
            status: 'success',
            data: {
                doctors
            }
        });
        
    } catch (error) {
        console.error('Get available doctors error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch doctors'
        });
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    cancelAppointment,
    getAvailableDoctors
}; 