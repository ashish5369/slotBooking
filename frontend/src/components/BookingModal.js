import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

const BookingModal = ({ show, onHide, onSubmit, slot }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal is closed/opened
  useEffect(() => {
    if (!show) {
      setFormData({ name: '', email: '', phone: '' });
      setValidated(false);
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
    setValidated(true);

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

      // Form will be reset by useEffect when modal closes
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to book slot. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="booking-modal">
      <Modal.Header closeButton>
        <Modal.Title>📅 Book Interview Slot</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {slot && (
          <div className="mb-4 p-3 bg-light rounded">
            <h6 className="mb-2">🎯 Selected Time Slot:</h6>
            <h5 className="text-primary mb-0">{formatDateTime(slot)}</h5>
          </div>
        )}

        {errors.submit && (
          <Alert variant="danger" className="mb-3">
            <strong>Booking Failed:</strong> {errors.submit}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>
              Full Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              isInvalid={!!errors.name}
              required
              maxLength={50}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name || 'Please provide your full name.'}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Enter your name as it appears on your resume
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>
              Email Address <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              isInvalid={!!errors.email}
              required
              maxLength={100}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email || 'Please provide a valid email address.'}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              We'll send booking confirmation to this email
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4" controlId="formPhone">
            <Form.Label>Phone Number (Optional)</Form.Label>
            <Form.Control
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              isInvalid={!!errors.phone}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              For interview reminders and updates
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              <span className="text-danger">*</span> Required fields
            </div>
            <div>
              <Button
                variant="outline-secondary"
                onClick={onHide}
                className="me-2"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Booking...
                  </>
                ) : (
                  '✨ Confirm Booking'
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BookingModal;
