import React, { useState, useEffect } from 'react';

const BookingModal = ({ show, onHide, onSubmit, slot }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal is closed/opened
  useEffect(() => {
    if (!show) {
      setFormData({ name: '', email: '', phone: '' });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [show]);

  // Format slot date and time for display
  const formatDateTime = (slot) => {
    if (!slot) return '';

    const date = new Date(slot.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `${formattedDate} from ${slot.startTime} to ${slot.endTime}`;
  };

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    if (!nameRegex.test(name.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    if (email.length > 100) return 'Email must be less than 100 characters';
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return null; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number (10-15 digits)';
    }
    return null;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null
      });
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to book slot. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050,
      padding: '20px'
    }} onClick={onHide}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button
          onClick={onHide}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            opacity: 0.6,
            transition: 'opacity 0.3s ease',
            padding: '5px',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            e.target.style.opacity = 1;
            e.target.style.background = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.opacity = 0.6;
            e.target.style.background = 'none';
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px',
            fontWeight: '700'
          }}>
            📅 Book Interview Slot
          </h2>
        </div>

        {/* Selected Slot Info */}
        {slot && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '5px' }}>
              🎯 Selected Time Slot
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              {formatDateTime(slot)}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div style={{
            background: 'rgba(220, 53, 69, 0.1)',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            color: '#721c24'
          }}>
            <strong>❌ Booking Failed:</strong> {errors.submit}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.95rem'
            }}>
              Full Name <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.name ? '2px solid #dc3545' : '2px solid #e9ecef',
                borderRadius: '10px',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.8)'
              }}
              onFocus={(e) => {
                if (!errors.name) {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.name ? '#dc3545' : '#e9ecef';
                e.target.style.boxShadow = 'none';
              }}
              maxLength={50}
              required
            />
            {errors.name && (
              <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '5px' }}>
                {errors.name}
              </div>
            )}
            <div style={{ color: '#6c757d', fontSize: '0.8rem', marginTop: '5px' }}>
              Enter your name as it appears on your resume
            </div>
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.95rem'
            }}>
              Email Address <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.email ? '2px solid #dc3545' : '2px solid #e9ecef',
                borderRadius: '10px',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.8)'
              }}
              onFocus={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.email ? '#dc3545' : '#e9ecef';
                e.target.style.boxShadow = 'none';
              }}
              maxLength={100}
              required
            />
            {errors.email && (
              <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '5px' }}>
                {errors.email}
              </div>
            )}
            <div style={{ color: '#6c757d', fontSize: '0.8rem', marginTop: '5px' }}>
              We'll send booking confirmation to this email
            </div>
          </div>

          {/* Phone Field */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.95rem'
            }}>
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.phone ? '2px solid #dc3545' : '2px solid #e9ecef',
                borderRadius: '10px',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.8)'
              }}
              onFocus={(e) => {
                if (!errors.phone) {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.phone ? '#dc3545' : '#e9ecef';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.phone && (
              <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '5px' }}>
                {errors.phone}
              </div>
            )}
            <div style={{ color: '#6c757d', fontSize: '0.8rem', marginTop: '5px' }}>
              For interview reminders and updates
            </div>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '30px'
          }}>
            <div style={{ color: '#6c757d', fontSize: '0.85rem' }}>
              <span style={{ color: '#dc3545' }}>*</span> Required fields
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onHide}
                disabled={isSubmitting}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #6c757d',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: '#6c757d',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.95rem',
                  opacity: isSubmitting ? 0.6 : 1
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.target.style.background = '#6c757d';
                    e.target.style.color = 'white';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#6c757d';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '10px',
                  background: isSubmitting
                    ? 'linear-gradient(135deg, #9ca3dc 0%, #9e8cc0 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Booking...
                  </>
                ) : (
                  <>✨ Confirm Booking</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BookingModal;
