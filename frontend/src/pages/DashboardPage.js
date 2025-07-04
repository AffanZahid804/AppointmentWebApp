import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import AppointmentCard from '../components/AppointmentCard';

/**
 * DashboardPage component with role-based dashboard for patient, doctor, and admin
 */
const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data.appointments);
    } catch (err) {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle status update for an appointment
   */
  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert('Failed to update appointment status.');
    }
  };

  /**
   * Handle appointment cancellation
   */
  const handleCancel = async (appointmentId) => {
    try {
      await api.post(`/appointments/${appointmentId}/cancel`);
      fetchAppointments();
    } catch (err) {
      alert('Failed to cancel appointment.');
    }
  };

  // Role-based dashboard title
  const getDashboardTitle = () => {
    if (user.role === 'patient') return 'My Appointments';
    if (user.role === 'doctor') return 'Doctor Dashboard';
    if (user.role === 'admin') return 'Admin Dashboard';
    return 'Dashboard';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{getDashboardTitle()}</h2>
      {loading ? (
        <div style={styles.loading}>Loading appointments...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : appointments.length === 0 ? (
        <div style={styles.empty}>No appointments found.</div>
      ) : (
        appointments.map((apt) => (
          <AppointmentCard
            key={apt._id}
            appointment={apt}
            onStatusUpdate={handleStatusUpdate}
            onCancel={handleCancel}
          />
        ))
      )}
      {user.role === 'admin' && (
        <div style={styles.adminNote}>
          <strong>Admin:</strong> User management and analytics features can be added here.
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    color: '#7f8c8d',
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    margin: '2rem 0',
  },
  empty: {
    color: '#7f8c8d',
    textAlign: 'center',
    margin: '2rem 0',
  },
  adminNote: {
    marginTop: '2rem',
    padding: '1rem',
    background: '#f4f6f8',
    borderRadius: '6px',
    color: '#2c3e50',
    textAlign: 'center',
  },
};

export default DashboardPage; 