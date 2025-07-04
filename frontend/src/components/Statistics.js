import React, { useState, useEffect } from 'react';
import { formatDateForDisplay, getCurrentDate } from '../utils/dateUtils';

/**
 * Statistics component for displaying appointment analytics
 */
const Statistics = ({ appointments = [], userRole }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    upcoming: 0,
    past: 0
  });

  // Calculate statistics when appointments change
  useEffect(() => {
    calculateStats();
  }, [appointments]);

  /**
   * Calculate all statistics
   */
  const calculateStats = () => {
    const today = getCurrentDate();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const newStats = {
      total: appointments.length,
      pending: appointments.filter(apt => apt.status === 'pending').length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
      today: appointments.filter(apt => apt.date === today).length,
      thisWeek: appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= weekStart && aptDate <= now;
      }).length,
      thisMonth: appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= monthStart && aptDate <= now;
      }).length,
      upcoming: appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate > now && apt.status !== 'cancelled';
      }).length,
      past: appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate < now;
      }).length
    };

    setStats(newStats);
  };

  /**
   * Get percentage for a stat
   */
  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'completed': return '#17a2b8';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  /**
   * Get recent appointments
   */
  const getRecentAppointments = () => {
    return appointments
      .filter(apt => apt.status !== 'cancelled')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  return (
    <div className="statistics">
      <h3 className="statistics-title">Statistics Overview</h3>
      
      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h4 className="stat-number">{stats.total}</h4>
            <p className="stat-label">Total Appointments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h4 className="stat-number">{stats.pending}</h4>
            <p className="stat-label">Pending</p>
            <small className="stat-percentage">
              {getPercentage(stats.pending, stats.total)}% of total
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h4 className="stat-number">{stats.confirmed}</h4>
            <p className="stat-label">Confirmed</p>
            <small className="stat-percentage">
              {getPercentage(stats.confirmed, stats.total)}% of total
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h4 className="stat-number">{stats.completed}</h4>
            <p className="stat-label">Completed</p>
            <small className="stat-percentage">
              {getPercentage(stats.completed, stats.total)}% of total
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h4 className="stat-number">{stats.today}</h4>
            <p className="stat-label">Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h4 className="stat-number">{stats.upcoming}</h4>
            <p className="stat-label">Upcoming</p>
          </div>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="stats-section">
        <h4>Status Distribution</h4>
        <div className="status-chart">
          {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
            <div key={status} className="status-bar">
              <div className="status-info">
                <span className="status-label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <span className="status-count">{stats[status]}</span>
              </div>
              <div className="status-progress">
                <div 
                  className="status-fill"
                  style={{
                    width: `${getPercentage(stats[status], stats.total)}%`,
                    backgroundColor: getStatusColor(status)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time-based Stats */}
      <div className="stats-section">
        <h4>Time-based Statistics</h4>
        <div className="time-stats">
          <div className="time-stat">
            <span className="time-label">This Week:</span>
            <span className="time-value">{stats.thisWeek}</span>
          </div>
          <div className="time-stat">
            <span className="time-label">This Month:</span>
            <span className="time-value">{stats.thisMonth}</span>
          </div>
          <div className="time-stat">
            <span className="time-label">Past Appointments:</span>
            <span className="time-value">{stats.past}</span>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="stats-section">
        <h4>Recent Appointments</h4>
        <div className="recent-appointments">
          {getRecentAppointments().length > 0 ? (
            getRecentAppointments().map(appointment => (
              <div key={appointment._id} className="recent-appointment">
                <div className="recent-appointment-info">
                  <span className="recent-date">
                    {formatDateForDisplay(appointment.date, 'short')}
                  </span>
                  <span className="recent-time">{appointment.time}</span>
                  <span className="recent-status" style={{ color: getStatusColor(appointment.status) }}>
                    {appointment.status}
                  </span>
                </div>
                <div className="recent-participants">
                  {userRole === 'patient' ? (
                    <span>Dr. {appointment.doctor?.name}</span>
                  ) : (
                    <span>{appointment.patient?.name}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-appointments">No recent appointments</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics; 