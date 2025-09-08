import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const BookingModal = ({ show, onHide, onSubmit, slot }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');

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

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    setValidated(true);
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    onSubmit({ name, email });
    
    // Reset form
    setName('');
    setEmail('');
    setValidated(false);
    setError('');
  };

  return (
    <Modal show={show} onHide={onHide} centered className="booking-modal">
      <Modal.Header closeButton>
        <Modal.Title>Book Interview Slot</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {slot && (
          <div className="mb-3">
            <p>You are booking a slot for:</p>
            <h5>{formatDateTime(slot)}</h5>
          </div>
        )}
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Your Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide your name.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email Address (as on your resume)</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid email.
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Your email address will be used to send booking confirmation.
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Booking
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BookingModal;
