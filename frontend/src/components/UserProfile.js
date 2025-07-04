import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

/**
 * UserProfile component for viewing and editing user profile
 */
const UserProfile = () => {
  const { user, login } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.phone && formData.phone.length > 15) {
      newErrors.phone = 'Phone number is too long';
    }

    if (formData.specialization && formData.specialization.length > 100) {
      newErrors.specialization = 'Specialization is too long';
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
      const response = await api.patch('/users/profile', formData);
      login(response.data.data.user, localStorage.getItem('token'));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      specialization: user?.specialization || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>User Profile</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                maxLength="50"
              />
              {errors.name && <span style={styles.error}>{errors.name}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={user.email}
                style={styles.input}
                disabled
              />
              <small style={styles.helpText}>Email cannot be changed</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
                maxLength="15"
              />
              {errors.phone && <span style={styles.error}>{errors.phone}</span>}
            </div>

            {user.role === 'doctor' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  style={styles.input}
                  maxLength="100"
                />
                {errors.specialization && (
                  <span style={styles.error}>{errors.specialization}</span>
                )}
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <input
                type="text"
                value={user.role}
                style={styles.input}
                disabled
              />
            </div>

            <div style={styles.buttons}>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.saveButton}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.profileInfo}>
            <div style={styles.infoRow}>
              <strong>Name:</strong> {user.name}
            </div>
            <div style={styles.infoRow}>
              <strong>Email:</strong> {user.email}
            </div>
            <div style={styles.infoRow}>
              <strong>Phone:</strong> {user.phone || 'Not provided'}
            </div>
            {user.role === 'doctor' && (
              <div style={styles.infoRow}>
                <strong>Specialization:</strong> {user.specialization || 'Not specified'}
              </div>
            )}
            <div style={styles.infoRow}>
              <strong>Role:</strong> {user.role}
            </div>
            <div style={styles.infoRow}>
              <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    margin: 0,
    color: '#2c3e50',
  },
  editButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2c3e50',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  helpText: {
    fontSize: '0.875rem',
    color: '#7f8c8d',
    marginTop: '0.25rem',
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
    marginTop: '1rem',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  infoRow: {
    padding: '0.75rem 0',
    borderBottom: '1px solid #ecf0f1',
    color: '#2c3e50',
  },
};

export default UserProfile; 