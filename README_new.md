# Interview Slot Booking Application - Simple Database Solution

## 🎯 **Overview**

This Interview Slot Booking application uses a **simple SQLite database** approach with **Excel export functionality**. No complex SharePoint setup needed! The system validates candidates against a pre-approved list and automatically exports data to Excel format.

## ✨ **Key Features**

### **For Candidates:**

- 🔍 **View available slots** in a clean calendar interface
- 📝 **Book slots easily** with name and email
- 🛡️ **Pre-screening validation** - only approved candidates can book
- ⚡ **Real-time availability** updates

### **For Administrators:**

- 👥 **Manage approved candidates** via simple admin panel
- 📅 **Add new interview slots** easily
- 📊 **Export to Excel** with one click
- 📈 **View all bookings** in real-time
- 🔄 **No technical skills needed** - simple web interface

## 🚀 **Quick Start (No Setup Required!)**

### **1. Backend Setup:**

```bash
cd backend
npm install
npm start
```

### **2. Frontend Setup:**

```bash
cd frontend
npm install
npm start
```

### **3. Access the Applications:**

- **📱 Candidate Booking**: http://localhost:3000
- **👨‍💼 Admin Panel**: http://localhost:5000/admin
- **🔧 API**: http://localhost:5000/api/slots

## 🎯 **How It Works**

### **Step 1: Admin adds approved candidates**

- Go to http://localhost:5000/admin
- Add candidate names and emails to the approved list
- These are the only people who can book slots

### **Step 2: Candidates book slots**

- Visit http://localhost:3000
- Enter name and email (must match approved list)
- Select available time slot
- System validates and books automatically

### **Step 3: Export to Excel**

- Click "Download Excel Report" in admin panel
- Get complete Excel file with:
  - **Sheet 1 "Slots"**: All slots with booking details
  - **Sheet 2 "Candidates"**: Approved candidate list

## 📋 **Sample Data Included**

The system comes with sample data:

**Pre-approved Candidates:**

- John Doe (john.doe@example.com)
- Jane Smith (jane.smith@example.com)
- Ashish Singh (ashish.singh282002@gmail.com)
- Test User (test@example.com)
- Demo Candidate (demo@company.com)

**Sample Slots:**

- Multiple time slots across September 9-11, 2025
- Mix of 1-hour morning and afternoon slots

## 🔧 **Admin Functions**

### **Via Admin Panel (http://localhost:5000/admin):**

- ➕ **Add candidates** to approved list
- ➕ **Add new time slots**
- 📊 **View all bookings** in real-time
- 📥 **Export Excel reports**
- 🔄 **Refresh data**

### **Excel Export Contains:**

| Slots Sheet | Candidates Sheet |
| ----------- | ---------------- |
| SlotID      | Name             |
| Date        | Email            |
| StartTime   |                  |
| EndTime     |                  |
| Status      |                  |
| BookedName  |                  |
| BookedEmail |                  |

## 🛡️ **Security & Validation**

- ✅ **Email format validation**
- ✅ **Name length validation** (minimum 2 characters)
- ✅ **Candidate pre-approval** (only approved emails can book)
- ✅ **Duplicate booking prevention**
- ✅ **Slot conflict prevention**
- ✅ **Input sanitization** (trim, normalize case)

## 📊 **Database Structure**

**SQLite Database** (automatically created):

- **`slots`** table: slot details and bookings
- **`candidates`** table: approved candidate list
- **Automatic sample data** insertion on first run

## 🔧 **API Endpoints**

**Public Endpoints:**

- `GET /api/slots` - Get all available slots
- `POST /api/slots/book` - Book a slot (with validation)

**Admin Endpoints:**

- `GET /api/slots/admin/candidates` - Get approved candidates
- `POST /api/slots/admin/candidates` - Add new candidate
- `POST /api/slots/add` - Add new slot
- `GET /api/slots/admin/export` - Download Excel report

## 💡 **Benefits of This Approach**

### **✅ Simplicity:**

- No Azure AD setup required
- No SharePoint configuration needed
- Works offline/locally
- Zero external dependencies

### **✅ Functionality:**

- Real candidate validation
- Excel export for reporting
- Easy admin management
- Production-ready features

### **✅ Future-Proof:**

- Can easily migrate to SharePoint later
- Database can be replaced with any SQL database
- API-first design allows easy integration

## 🔄 **Power Automate Integration (Optional)**

You can easily set up Power Automate to:

1. **Monitor the exports folder** for new Excel files
2. **Automatically upload** to SharePoint when Excel is exported
3. **Send email notifications** when bookings are made
4. **Sync with other systems** using the API endpoints

## 🧪 **Testing the System**

### **Test Valid Booking:**

```bash
curl -X POST "http://localhost:5000/api/slots/book" \
  -H "Content-Type: application/json" \
  -d '{"slotId":"slot-001","name":"John Doe","email":"john.doe@example.com"}'
```

### **Test Invalid Booking:**

```bash
curl -X POST "http://localhost:5000/api/slots/book" \
  -H "Content-Type: application/json" \
  -d '{"slotId":"slot-002","name":"Unknown Person","email":"unknown@example.com"}'
```

## 🚨 **Troubleshooting**

**Port Already in Use:**

```bash
pkill -f "node server.js"
npm start
```

**Database Issues:**

- Delete `database.sqlite` file to reset
- Restart server to recreate with sample data

**Excel Export Issues:**

- Check `exports/` folder is created
- Ensure write permissions

## 📈 **Scaling Options**

**Current Setup:** Perfect for 50-100 candidates
**To Scale:**

- Replace SQLite with PostgreSQL/MySQL
- Add Redis for caching
- Deploy to cloud (Heroku, AWS, Azure)
- Add authentication for admin panel

---

## 🎉 **Ready to Use!**

This solution gives you **all the benefits** of SharePoint integration **without the complexity**:

✅ **Candidate validation**  
✅ **Excel exports**  
✅ **Real-time booking**  
✅ **Admin management**  
✅ **Zero configuration**

**Start booking interviews in under 5 minutes!** 🚀
