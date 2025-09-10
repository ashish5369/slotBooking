import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const SlotCalendar = ({ slots, onSlotSelect }) => {
  // Convert slots data to FullCalendar event format
  const events = slots.map(slot => ({
    id: slot.slotId,
    title: slot.status === 'Available' ? '✅ Available' : '🔒 Booked',
    start: `${slot.date}T${slot.startTime}`,
    end: `${slot.date}T${slot.endTime}`,
    extendedProps: { 
      ...slot,
      description: slot.status === 'Available' 
        ? 'Click to book this slot' 
        : `Booked by ${slot.bookedName || 'Someone'}`
    },
    classNames: slot.status === 'Available' ? ['available'] : ['booked'],
    color: slot.status === 'Available' ? '#28a745' : '#dc3545',
    borderColor: slot.status === 'Available' ? '#20c997' : '#fd7e14',
    textColor: '#ffffff'
  }));

  // Handle calendar event click
  const handleEventClick = (clickInfo) => {
    const slot = clickInfo.event.extendedProps;
    
    // Add visual feedback
    if (slot.status === 'Available') {
      clickInfo.el.style.transform = 'scale(0.95)';
      setTimeout(() => {
        clickInfo.el.style.transform = 'scale(1)';
      }, 150);
      onSlotSelect(slot);
    } else {
      // Show feedback for booked slots
      clickInfo.el.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        clickInfo.el.style.animation = '';
      }, 500);
    }
  };

  // Custom event content
  const renderEventContent = (eventInfo) => {
    const isAvailable = eventInfo.event.extendedProps.status === 'Available';
    
    return (
      <div style={{
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: '500',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        textAlign: 'center',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        <div style={{ fontSize: '0.9em', marginBottom: '2px' }}>
          {eventInfo.event.title}
        </div>
        <div style={{ fontSize: '0.75em', opacity: 0.9 }}>
          {eventInfo.timeText}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div style={{ textAlign: 'center' }}>
        <div className="calendar-legend">
          <div className="calendar-legend-item">
            <div 
              className="legend-color"
              style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
              }}
            ></div>
            Available Slots
          </div>
          <div className="calendar-legend-item">
            <div 
              className="legend-color"
              style={{
                background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)'
              }}
            ></div>
            Booked Slots
          </div>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        height="auto"
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        nowIndicator={true}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
          startTime: '09:00',
          endTime: '17:00',
        }}
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        expandRows={true}
        dayMaxEvents={3}
        moreLinkClick="popover"
        eventDisplay="block"
        displayEventTime={true}
        displayEventEnd={false}
        dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }}
      />
      
      <div className="calendar-tip">
        💡 <strong>Tip:</strong> Click on any available (green) time slot to book your interview. Hover over booked slots to see who reserved them.
      </div>
    </div>
  );
};

export default SlotCalendar;
