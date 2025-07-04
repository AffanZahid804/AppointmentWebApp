/**
 * Date utility functions for appointment scheduling and date manipulation
 */

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} - Current date
 */
export const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Get current time in HH:MM format
 * @returns {string} - Current time
 */
export const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Check if a date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
export const isPastDate = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Check if a date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if date is in the future
 */
export const isFutureDate = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
};

/**
 * Get day of week name
 * @param {string|Date} date - Date to get day name for
 * @returns {string} - Day name
 */
export const getDayName = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Get month name
 * @param {string|Date} date - Date to get month name for
 * @returns {string} - Month name
 */
export const getMonthName = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', { month: 'long' });
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'full')
 * @returns {string} - Formatted date
 */
export const formatDateForDisplay = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    case 'full':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return dateObj.toLocaleDateString();
  }
};

/**
 * Format time for display
 * @param {string} time - Time to format (HH:MM)
 * @returns {string} - Formatted time (12-hour format)
 */
export const formatTimeForDisplay = (time) => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Get available time slots for a given date
 * @param {string} date - Date to get slots for
 * @param {Array} existingAppointments - Array of existing appointments
 * @param {number} slotDuration - Duration of each slot in minutes (default: 30)
 * @returns {Array} - Array of available time slots
 */
export const getAvailableTimeSlots = (date, existingAppointments = [], slotDuration = 30) => {
  const slots = [];
  const startHour = 8; // 8 AM
  const endHour = 20; // 8 PM
  const minutesInDay = (endHour - startHour) * 60;
  const numberOfSlots = Math.floor(minutesInDay / slotDuration);
  
  // Create all possible slots
  for (let i = 0; i < numberOfSlots; i++) {
    const minutes = i * slotDuration;
    const hour = Math.floor(minutes / 60) + startHour;
    const minute = minutes % 60;
    const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Check if slot is available
    const isBooked = existingAppointments.some(apt => 
      apt.date === date && apt.time === timeSlot && apt.status !== 'cancelled'
    );
    
    if (!isBooked) {
      slots.push(timeSlot);
    }
  }
  
  return slots;
};

/**
 * Check if a time slot is available
 * @param {string} date - Date to check
 * @param {string} time - Time to check
 * @param {Array} existingAppointments - Array of existing appointments
 * @returns {boolean} - True if slot is available
 */
export const isTimeSlotAvailable = (date, time, existingAppointments = []) => {
  return !existingAppointments.some(apt => 
    apt.date === date && apt.time === time && apt.status !== 'cancelled'
  );
};

/**
 * Get next available appointment date
 * @param {Array} existingAppointments - Array of existing appointments
 * @param {number} daysToCheck - Number of days to check ahead (default: 30)
 * @returns {string} - Next available date
 */
export const getNextAvailableDate = (existingAppointments = [], daysToCheck = 30) => {
  const today = new Date();
  
  for (let i = 1; i <= daysToCheck; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dateString = checkDate.toISOString().split('T')[0];
    
    // Check if there are any available slots on this date
    const dayAppointments = existingAppointments.filter(apt => apt.date === dateString);
    const availableSlots = getAvailableTimeSlots(dateString, dayAppointments);
    
    if (availableSlots.length > 0) {
      return dateString;
    }
  }
  
  return null;
};

/**
 * Calculate appointment end time
 * @param {string} startTime - Start time (HH:MM)
 * @param {number} duration - Duration in minutes
 * @returns {string} - End time (HH:MM)
 */
export const calculateEndTime = (startTime, duration) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

/**
 * Check if two time slots overlap
 * @param {string} start1 - First start time
 * @param {number} duration1 - First duration
 * @param {string} start2 - Second start time
 * @param {number} duration2 - Second duration
 * @returns {boolean} - True if slots overlap
 */
export const doTimeSlotsOverlap = (start1, duration1, start2, duration2) => {
  const [hours1, minutes1] = start1.split(':').map(Number);
  const [hours2, minutes2] = start2.split(':').map(Number);
  
  const start1Minutes = hours1 * 60 + minutes1;
  const end1Minutes = start1Minutes + duration1;
  const start2Minutes = hours2 * 60 + minutes2;
  const end2Minutes = start2Minutes + duration2;
  
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

/**
 * Get week dates for a given date
 * @param {string|Date} date - Date to get week for
 * @returns {Array} - Array of dates in the week
 */
export const getWeekDates = (date) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  const weekStart = new Date(dateObj);
  weekStart.setDate(dateObj.getDate() - dayOfWeek);
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(weekStart);
    weekDate.setDate(weekStart.getDate() + i);
    weekDates.push(weekDate.toISOString().split('T')[0]);
  }
  
  return weekDates;
};

/**
 * Get month dates for a given date
 * @param {string|Date} date - Date to get month for
 * @returns {Array} - Array of dates in the month
 */
export const getMonthDates = (date) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const monthDates = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const monthDate = new Date(year, month, day);
    monthDates.push(monthDate.toISOString().split('T')[0]);
  }
  
  return monthDates;
};

/**
 * Add days to a date
 * @param {string|Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {string} - New date in YYYY-MM-DD format
 */
export const addDays = (date, days) => {
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj.toISOString().split('T')[0];
};

/**
 * Subtract days from a date
 * @param {string|Date} date - Base date
 * @param {number} days - Number of days to subtract
 * @returns {string} - New date in YYYY-MM-DD format
 */
export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

/**
 * Get relative time description
 * @param {string|Date} date - Date to describe
 * @returns {string} - Relative time description
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const dateObj = new Date(date);
  const diffInMs = now - dateObj;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays === -1) return 'Tomorrow';
  if (diffInDays > 0) return `${diffInDays} days ago`;
  if (diffInDays < 0) return `In ${Math.abs(diffInDays)} days`;
  
  return formatDateForDisplay(date);
}; 