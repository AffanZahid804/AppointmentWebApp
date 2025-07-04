import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * AppointmentForm component for booking new appointments
 */
const AppointmentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    notes: '',
    symptoms: '',
    duration: 30,
    isUrgent: false,
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch available doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/appointments/doctors/list');
      setDoctors(response.data.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Please select a time';
    }

    if (formData.duration < 15 || formData.duration > 120) {
      newErrors.duration = 'Duration must be between 15 and 120 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        doctorId: '',
        date: '',
        time: '',
        notes: '',
        symptoms: '',
        duration: 30,
        isUrgent: false,
      });
    } catch (error) {
      console.error('Error submitting appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Book New Appointment</h2>

      <div style={styles.formGroup}>
        <label style={styles.label}>Doctor *</label>
        <select
          name="doctorId"
          value={formData.doctorId}
          onChange={handleChange}
          style={styles.select}
        >
          <option value="">Select a doctor</option>
          {doctors.map(doctor => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name} - {doctor.specialization}
            </option>
          ))}
        </select>
        {errors.doctorId && <span style={styles.error}>{errors.doctorId}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Date *</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          style={styles.input}
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.date && <span style={styles.error}>{errors.date}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Time *</label>
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          style={styles.input}
        />
        {errors.time && <span style={styles.error}>{errors.time}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Duration (minutes)</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          style={styles.input}
          min="15"
          max="120"
        />
        {errors.duration && <span style={styles.error}>{errors.duration}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Symptoms</label>
        <textarea
          name="symptoms"
          value={formData.symptoms}
          onChange={handleChange}
          style={styles.textarea}
          placeholder="Describe your symptoms..."
          maxLength="300"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          style={styles.textarea}
          placeholder="Any additional notes..."
          maxLength="500"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isUrgent"
            checked={formData.isUrgent}
            onChange={handleChange}
            style={styles.checkbox}
          />
          Mark as urgent
        </label>
      </div>

      <div style={styles.buttons}>
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '2rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    minHeight: '100px',
    resize: 'vertical',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
  error: {
    color: '#e74c3c',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2rem',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default AppointmentForm; 