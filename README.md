# Interview Slot Booking Application

A full-stack web application for booking interview time slots. Users can view available slots in a calendar interface and book them by providing their name and email.

## Project Structure

- `/frontend` - React application with FullCalendar integration
- `/backend` - Node.js/Express API server

## Features

- Interactive calendar to view available slots
- Modal for booking with name and email
- Automatic status update for booked slots
- RESTful API for slot management

## Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

The backend server will run on http://localhost:5000

## Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The frontend application will run on http://localhost:3000

## API Endpoints

- `GET /api/slots` - Get all slots
- `GET /api/slots/:slotId` - Get a specific slot by ID
- `POST /api/slots/book` - Book a slot (requires slotId, name, email in request body)

## Data Structure

Slots are stored in a JSON file with the following structure:

```json
{
  "slotId": "slot-001",
  "date": "2025-09-08",
  "startTime": "09:00",
  "endTime": "10:00",
  "status": "Available",
  "bookedName": null,
  "bookedEmail": null
}
```