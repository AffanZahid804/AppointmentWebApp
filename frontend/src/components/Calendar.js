import React, { useState, useEffect } from 'react';
import { formatDateForDisplay, getDayName, getMonthName, getWeekDates, isToday, isPastDate } from '../utils/dateUtils';

/**
 * Calendar component for appointment scheduling
 */
const Calendar = ({ selectedDate, onDateSelect, appointments = [], disabled = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDates, setCalendarDates] = useState([]);

  // Generate calendar dates when current month changes
  useEffect(() => {
    generateCalendarDates();
  }, [currentMonth]);

  /**
   * Generate calendar dates for the current month
   */
  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Get dates from previous month to fill first week
    const prevMonthDates = [];
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      prevMonthDates.push(new Date(year, month - 1, prevMonth.getDate() - i));
    }
    
    // Get dates for current month
    const currentMonthDates = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      currentMonthDates.push(new Date(year, month, day));
    }
    
    // Get dates from next month to fill last week
    const nextMonthDates = [];
    const remainingDays = 42 - (prevMonthDates.length + currentMonthDates.length);
    for (let day = 1; day <= remainingDays; day++) {
      nextMonthDates.push(new Date(year, month + 1, day));
    }
    
    setCalendarDates([...prevMonthDates, ...currentMonthDates, ...nextMonthDates]);
  };

  /**
   * Navigate to previous month
   */
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  /**
   * Navigate to next month
   */
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  /**
   * Navigate to today
   */
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  /**
   * Handle date selection
   */
  const handleDateClick = (date) => {
    if (disabled || isPastDate(date)) return;
    onDateSelect(date.toISOString().split('T')[0]);
  };

  /**
   * Get appointment count for a date
   */
  const getAppointmentCount = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString).length;
  };

  /**
   * Check if date has appointments
   */
  const hasAppointments = (date) => {
    return getAppointmentCount(date) > 0;
  };

  /**
   * Get CSS class for a date
   */
  const getDateClass = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const isSelected = selectedDate === dateString;
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isCurrentDay = isToday(date);
    const isPast = isPastDate(date);
    const hasAppts = hasAppointments(date);
    
    let className = 'calendar-date';
    
    if (!isCurrentMonth) className += ' other-month';
    if (isCurrentDay) className += ' today';
    if (isSelected) className += ' selected';
    if (isPast) className += ' past';
    if (hasAppts) className += ' has-appointments';
    if (disabled || isPast) className += ' disabled';
    
    return className;
  };

  return (
    <div className="calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button 
          className="btn btn-secondary" 
          onClick={goToPreviousMonth}
          disabled={disabled}
        >
          ‹
        </button>
        <div className="calendar-title">
          <h3>{getMonthName(currentMonth)} {currentMonth.getFullYear()}</h3>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={goToToday}
            disabled={disabled}
          >
            Today
          </button>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={goToNextMonth}
          disabled={disabled}
        >
          ›
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Day headers */}
        <div className="calendar-week-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar dates */}
        <div className="calendar-dates">
          {calendarDates.map((date, index) => (
            <div
              key={index}
              className={getDateClass(date)}
              onClick={() => handleDateClick(date)}
            >
              <span className="date-number">{date.getDate()}</span>
              {hasAppointments(date) && (
                <span className="appointment-indicator">
                  {getAppointmentCount(date)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color today"></span>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <span className="legend-color selected"></span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-color has-appointments"></span>
          <span>Has Appointments</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 