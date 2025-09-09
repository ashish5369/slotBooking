# Interview Slot Booking Application - SharePoint Excel Integration

## 🎯 Overview

This Interview Slot Booking application is designed to work seamlessly with SharePoint Excel sheets, allowing for real-time synchronization between your booking website and Excel data. The application automatically detects whether SharePoint is configured and falls back to local JSON storage if not.

## ✨ Features

### **For Candidates:**

- 🔍 View available interview slots in a calendar format
- 📝 Book slots with name and email validation
- ⚡ Real-time availability updates
- 📱 Responsive design for all devices

### **For Administrators:**

- 📊 **Excel-based slot management** - Add, edit, and remove slots directly in SharePoint Excel
- 🔄 **Real-time sync** - Changes in Excel immediately reflect on the website
- 📈 **Easy tracking** - View all bookings and candidate information in Excel
- 🛡️ **Data validation** - Built-in validation for all inputs

## 🔧 Setup Options

### Option 1: SharePoint Excel Integration (Recommended for Enterprise)

1. **Follow the SharePoint setup guide**: See `SHAREPOINT_SETUP.md` for detailed instructions
2. **Configure your .env file** with Azure AD and SharePoint credentials
3. **Create Excel sheet** with the required columns in SharePoint
4. **Start the application** - it will automatically use SharePoint Excel

### Option 2: Local JSON File (Quick Start)

1. **No configuration needed** - the application will automatically use local JSON storage
2. **Start the application** directly with `npm start`
3. **Perfect for development** and testing

## 🚀 Quick Start

### Backend Setup:

```bash
cd backend
npm install
npm start
```

### Frontend Setup:

```bash
cd frontend
npm install
npm start
```

### Access the Application:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/api/slots

## 📋 Excel Sheet Format

When using SharePoint integration, your Excel sheet should have these columns:

| SlotID   | Date       | StartTime | EndTime | Status    | BookedName | BookedEmail      |
| -------- | ---------- | --------- | ------- | --------- | ---------- | ---------------- |
| slot-001 | 2025-09-08 | 09:00     | 10:00   | Available |            |                  |
| slot-002 | 2025-09-08 | 11:00     | 12:00   | Booked    | John Doe   | john@example.com |

### Column Descriptions:

- **SlotID**: Unique identifier for each slot
- **Date**: Date in YYYY-MM-DD format
- **StartTime**: Start time in HH:MM format (24-hour)
- **EndTime**: End time in HH:MM format (24-hour)
- **Status**: Either "Available" or "Booked"
- **BookedName**: Name of the person who booked (auto-filled)
- **BookedEmail**: Email of the person who booked (auto-filled)

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
