/**
 * Validation utilities for form validation
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (basic)
 */
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`
    };
  }

  if (!hasUpperCase || !hasLowerCase) {
    return {
      isValid: false,
      message: 'Password must contain both uppercase and lowercase letters'
    };
  }

  if (!hasNumbers) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }

  return {
    isValid: true,
    message: 'Password is strong'
  };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone number
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Optional field
  return PHONE_REGEX.test(phone.replace(/\s/g, ''));
};

/**
 * Validate appointment date
 * @param {string} date - Date to validate
 * @returns {Object} - Validation result
 */
export const validateAppointmentDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return {
      isValid: false,
      message: 'Appointment date cannot be in the past'
    };
  }

  // Check if date is not more than 1 year in the future
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  if (selectedDate > oneYearFromNow) {
    return {
      isValid: false,
      message: 'Appointment date cannot be more than 1 year in the future'
    };
  }

  return {
    isValid: true,
    message: 'Date is valid'
  };
};

/**
 * Validate appointment time
 * @param {string} time - Time to validate
 * @returns {Object} - Validation result
 */
export const validateAppointmentTime = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(time)) {
    return {
      isValid: false,
      message: 'Please enter a valid time in HH:MM format'
    };
  }

  const [hours, minutes] = time.split(':').map(Number);
  
  // Check if time is within business hours (8 AM to 8 PM)
  if (hours < 8 || hours >= 20) {
    return {
      isValid: false,
      message: 'Appointments must be scheduled between 8:00 AM and 8:00 PM'
    };
  }

  return {
    isValid: true,
    message: 'Time is valid'
  };
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} - Validation result
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required`
    };
  }
  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validate string length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} - Validation result
 */
export const validateLength = (value, minLength, maxLength, fieldName) => {
  if (!value) return { isValid: true, message: '' };
  
  if (value.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${minLength} characters long`
    };
  }
  
  if (value.length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName} cannot exceed ${maxLength} characters`
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validate registration form
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with errors object
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};

  // Name validation
  const nameValidation = validateRequired(formData.name, 'Name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  } else {
    const nameLengthValidation = validateLength(formData.name, 2, 50, 'Name');
    if (!nameLengthValidation.isValid) {
      errors.name = nameLengthValidation.message;
    }
  }

  // Email validation
  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }

  // Role validation
  if (!['patient', 'doctor'].includes(formData.role)) {
    errors.role = 'Please select a valid role';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate login form
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with errors object
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  // Email validation
  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  const passwordValidation = validateRequired(formData.password, 'Password');
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate appointment form
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with errors object
 */
export const validateAppointmentForm = (formData) => {
  const errors = {};

  // Doctor validation
  if (!formData.doctorId) {
    errors.doctorId = 'Please select a doctor';
  }

  // Date validation
  const dateValidation = validateAppointmentDate(formData.date);
  if (!dateValidation.isValid) {
    errors.date = dateValidation.message;
  }

  // Time validation
  const timeValidation = validateAppointmentTime(formData.time);
  if (!timeValidation.isValid) {
    errors.time = timeValidation.message;
  }

  // Duration validation
  if (formData.duration < 15 || formData.duration > 120) {
    errors.duration = 'Duration must be between 15 and 120 minutes';
  }

  // Symptoms validation (optional but if provided, check length)
  if (formData.symptoms) {
    const symptomsValidation = validateLength(formData.symptoms, 1, 300, 'Symptoms');
    if (!symptomsValidation.isValid) {
      errors.symptoms = symptomsValidation.message;
    }
  }

  // Notes validation (optional but if provided, check length)
  if (formData.notes) {
    const notesValidation = validateLength(formData.notes, 1, 500, 'Notes');
    if (!notesValidation.isValid) {
      errors.notes = notesValidation.message;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time for display
 * @param {string} time - Time to format
 * @returns {string} - Formatted time
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
}; 