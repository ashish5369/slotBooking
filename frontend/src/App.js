import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import SlotCalendar from './components/SlotCalendar';
import BookingModal from './components/BookingModal';
import { getAllSlots, bookSlot } from './services/slotService';
import './App.css';

function App() {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all slots when component mounts
  useEffect(() => {
    fetchSlots();
  }, []);

  // Function to fetch all slots
  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await getAllSlots();
      setSlots(data);
      setError(null);
    } catch (err) {
      setError('Failed to load slots. Please try again later.');
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for slot selection
  const handleSlotSelect = (slot) => {
    if (slot.status === 'Available') {
      setSelectedSlot(slot);
      setShowModal(true);
    }
  };

  // Handler for booking submission
  const handleBookingSubmit = async (bookingData) => {
    try {
      await bookSlot({
        slotId: selectedSlot.slotId,
        name: bookingData.name,
        email: bookingData.email
      });
      
      // Close modal and show success message
      setShowModal(false);
      setAlert({
        show: true,
        variant: 'success',
        message: 'Your slot has been booked successfully!'
      });
      
      // Refresh slots to update UI
      fetchSlots();
    } catch (err) {
      setAlert({
        show: true,
        variant: 'danger',
        message: err.response?.data?.message || 'Failed to book slot. Please try again.'
      });
    }
  };

  // Close alert
  const handleCloseAlert = () => {
    setAlert({ ...alert, show: false });
  };

  return (
    <Container className="mt-5">
      <Row className="header">
        <Col>
          <h1>Interview Slot Booking</h1>
          <p>Select an available time slot for your interview</p>
        </Col>
      </Row>

      {alert.show && (
        <Alert 
          variant={alert.variant} 
          onClose={handleCloseAlert} 
          dismissible
        >
          {alert.message}
        </Alert>
      )}

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center my-5">
          <p>Loading available slots...</p>
        </div>
      ) : (
        <SlotCalendar 
          slots={slots} 
          onSlotSelect={handleSlotSelect} 
        />
      )}

      <BookingModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        onSubmit={handleBookingSubmit}
        slot={selectedSlot}
      />
    </Container>
  );
}

export default App;
