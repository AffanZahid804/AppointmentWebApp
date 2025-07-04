import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentForm from '../components/AppointmentForm';
import api from '../services/api';

/**
 * BookAppointmentPage component for booking new appointments
 */
const BookAppointmentPage = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle appointment form submission
   */
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/appointments', formData);
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to book appointment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {success && <div style={styles.success}>{success}</div>}
      {error && <div style={styles.error}>{error}</div>}
      <AppointmentForm onSubmit={handleSubmit} onCancel={() => navigate('/dashboard')} />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  success: {
    color: '#27ae60',
    background: '#eafaf1',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    color: '#e74c3c',
    background: '#fdecea',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center',
    fontWeight: 'bold',
  },
};

export default BookAppointmentPage; 