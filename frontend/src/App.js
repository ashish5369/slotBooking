import React, { useState, useEffect } from 'react';
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
        message: '✅ Your slot has been booked successfully!'
      });

      // Refresh slots to update UI
      fetchSlots();

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
    } catch (err) {
      setAlert({
        show: true,
        variant: 'danger',
        message: err.response?.data?.message || '❌ Failed to book slot. Please try again.'
      });
    }
  };

  // Close alert
  const handleCloseAlert = () => {
    setAlert({ ...alert, show: false });
  };

  return (
    <div className="App">
      <div className="main-container">
        {/* Modern Header */}
        <div className="modern-header">
          <h1>
            <span className="emoji">📅</span>
            <span className="text">Interview Slot Booking</span>
          </h1>
          <p>Select an available time slot for your interview</p>
        </div>

        {/* Alert Messages */}
        {alert.show && (
          <div className={`modern-alert alert-${alert.variant}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{alert.message}</span>
              <button
                onClick={handleCloseAlert}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'opacity 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.opacity = 1}
                onMouseOut={(e) => e.target.style.opacity = 0.7}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="modern-alert alert-danger">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>❌ {error}</span>
              <button
                onClick={() => setError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'opacity 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.opacity = 1}
                onMouseOut={(e) => e.target.style.opacity = 0.7}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading available slots...</div>
          </div>
        ) : (
          <SlotCalendar
            slots={slots}
            onSlotSelect={handleSlotSelect}
          />
        )}

        {/* Booking Modal */}
        <BookingModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSubmit={handleBookingSubmit}
          slot={selectedSlot}
        />
      </div>
    </div>
  );
}

export default App;
