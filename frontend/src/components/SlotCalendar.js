import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card } from 'react-bootstrap';

const SlotCalendar = ({ slots, onSlotSelect }) => {
  // Convert slots data to FullCalendar event format
  const events = slots.map(slot => ({
    id: slot.slotId,
    title: slot.status === 'Available' ? 'Available' : 'Booked',
    start: `${slot.date}T${slot.startTime}`,
    end: `${slot.date}T${slot.endTime}`,
    extendedProps: { ...slot },
    classNames: slot.status === 'Available' ? ['available'] : ['booked'],
    color: slot.status === 'Available' ? '#28a745' : '#dc3545'
  }));

  // Handle calendar event click
  const handleEventClick = (clickInfo) => {
    const slot = clickInfo.event.extendedProps;
    onSlotSelect(slot);
  };

  return (
    <Card className="calendar-container shadow-sm">
      <Card.Body>
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
        />
      </Card.Body>
    </Card>
  );
};

export default SlotCalendar;
