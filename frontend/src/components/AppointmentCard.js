import React from 'react';

/**
 * AppointmentCard component to display appointment details
 */
const AppointmentCard = ({ appointment, onStatusUpdate, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'confirmed':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      case 'completed':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          Appointment with {appointment.doctor?.name || 'Doctor'}
        </h3>
        <span
          style={{
            ...styles.status,
            backgroundColor: getStatusColor(appointment.status),
          }}
        >
          {appointment.status.toUpperCase()}
        </span>
      </div>

      <div style={styles.details}>
        <div style={styles.detailRow}>
          <strong>Date:</strong> {formatDate(appointment.date)}
        </div>
        <div style={styles.detailRow}>
          <strong>Time:</strong> {formatTime(appointment.time)}
        </div>
        <div style={styles.detailRow}>
          <strong>Duration:</strong> {appointment.duration} minutes
        </div>
        {appointment.doctor?.specialization && (
          <div style={styles.detailRow}>
            <strong>Specialization:</strong> {appointment.doctor.specialization}
          </div>
        )}
        {appointment.notes && (
          <div style={styles.detailRow}>
            <strong>Notes:</strong> {appointment.notes}
          </div>
        )}
        {appointment.symptoms && (
          <div style={styles.detailRow}>
            <strong>Symptoms:</strong> {appointment.symptoms}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        {appointment.status === 'pending' && (
          <>
            <button
              onClick={() => onStatusUpdate(appointment._id, 'confirmed')}
              style={styles.confirmBtn}
            >
              Confirm
            </button>
            <button
              onClick={() => onCancel(appointment._id)}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </>
        )}
        {appointment.status === 'confirmed' && (
          <button
            onClick={() => onStatusUpdate(appointment._id, 'completed')}
            style={styles.completeBtn}
          >
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    margin: '1rem 0',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
    color: '#2c3e50',
  },
  status: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  details: {
    marginBottom: '1rem',
  },
  detailRow: {
    margin: '0.5rem 0',
    color: '#555',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  confirmBtn: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  completeBtn: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default AppointmentCard; 