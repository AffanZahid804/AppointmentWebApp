const mongoose = require('mongoose');

/**
 * Appointment Schema for the booking system
 * Links patients with doctors for scheduled appointments
 */
const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },
    
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required']
    },
    
    date: {
        type: Date,
        required: [true, 'Appointment date is required'],
        validate: {
            validator: function(value) {
                // Ensure appointment date is not in the past
                return value > new Date();
            },
            message: 'Appointment date cannot be in the past'
        }
    },
    
    time: {
        type: String,
        required: [true, 'Appointment time is required'],
        match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            'Please enter a valid time in HH:MM format'
        ]
    },
    
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    
    symptoms: {
        type: String,
        trim: true,
        maxlength: [300, 'Symptoms description cannot exceed 300 characters']
    },
    
    duration: {
        type: Number,
        default: 30, // Default appointment duration in minutes
        min: [15, 'Appointment duration must be at least 15 minutes'],
        max: [120, 'Appointment duration cannot exceed 120 minutes']
    },
    
    isUrgent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

/**
 * Pre-save middleware to validate appointment conflicts
 */
appointmentSchema.pre('save', async function(next) {
    try {
        // Check for appointment conflicts (same doctor, same date/time)
        const existingAppointment = await this.constructor.findOne({
            doctorId: this.doctorId,
            date: this.date,
            time: this.time,
            status: { $nin: ['cancelled'] },
            _id: { $ne: this._id } // Exclude current appointment if updating
        });
        
        if (existingAppointment) {
            const error = new Error('Appointment slot is already booked');
            error.status = 400;
            return next(error);
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Static method to get appointments with populated user data
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of appointments with populated data
 */
appointmentSchema.statics.getAppointmentsWithUsers = async function(filter = {}, options = {}) {
    try {
        const appointments = await this.find(filter)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name email phone specialization')
            .sort({ date: 1, time: 1 })
            .limit(options.limit || 50)
            .skip(options.skip || 0);
            
        return appointments;
    } catch (error) {
        throw new Error('Failed to fetch appointments with user data');
    }
};

/**
 * Instance method to check if appointment can be cancelled
 * @returns {boolean} - True if appointment can be cancelled
 */
appointmentSchema.methods.canBeCancelled = function() {
    const now = new Date();
    const appointmentDateTime = new Date(this.date);
    appointmentDateTime.setHours(parseInt(this.time.split(':')[0]));
    appointmentDateTime.setMinutes(parseInt(this.time.split(':')[1]));
    
    // Can cancel if appointment is more than 2 hours away
    const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));
    return appointmentDateTime > twoHoursFromNow;
};

/**
 * Instance method to get appointment details for display
 * @returns {Object} - Formatted appointment details
 */
appointmentSchema.methods.getDisplayDetails = function() {
    return {
        _id: this._id,
        date: this.date,
        time: this.time,
        status: this.status,
        notes: this.notes,
        symptoms: this.symptoms,
        duration: this.duration,
        isUrgent: this.isUrgent,
        createdAt: this.createdAt,
        canBeCancelled: this.canBeCancelled()
    };
};

// Create indexes for better query performance
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, time: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema); 