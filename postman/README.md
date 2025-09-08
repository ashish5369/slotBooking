# Postman API Tests for Slot Booking Backend

This directory contains comprehensive Postman tests for the Interview Slot Booking API backend. These tests cover all API endpoints with both success and error scenarios.

## 📁 Files Included

- `SlotBooking_API_Tests.postman_collection.json` - Complete test collection with automated assertions
- `SlotBooking_Environment.postman_environment.json` - Environment configuration for local development
- `README.md` - This documentation file

## 🚀 Quick Start

### Prerequisites
1. **Postman** installed on your system ([Download Postman](https://www.postman.com/downloads/))
2. **Backend server** running on `http://localhost:5000`

### Setup Instructions

1. **Start the Backend Server**
   ```bash
   cd backend
   npm install
   npm start
   ```
   The server should be running on `http://localhost:5000`

2. **Import Collection into Postman**
   - Open Postman
   - Click "Import" button
   - Select `SlotBooking_API_Tests.postman_collection.json`
   - Click "Import"

3. **Import Environment**
   - Click "Import" again
   - Select `SlotBooking_Environment.postman_environment.json`
   - Click "Import"
   - Select "Slot Booking API Environment" from the environment dropdown

4. **Run Tests**
   - Select the imported collection
   - Click "Run collection" or use the Collection Runner
   - All tests will run automatically with assertions

## 🧪 Test Categories

### 1. Health Check Tests
- **Server Health Check**: Verifies the API server is running and responding

### 2. Get All Slots Tests
- **Get All Available Slots**: Tests retrieving all slots with proper validation
- Validates response structure, data types, and performance

### 3. Get Specific Slot Tests
- **Get Slot by ID - Success**: Tests retrieving a specific slot
- **Get Slot by ID - Not Found**: Tests error handling for invalid slot IDs

### 4. Book Slot Tests
- **Book Slot - Success**: Tests successful slot booking
- **Book Slot - Missing Required Fields**: Tests validation errors
- **Book Slot - Empty Body**: Tests validation with empty request
- **Book Slot - Non-existent Slot ID**: Tests booking invalid slots
- **Book Slot - Already Booked**: Tests duplicate booking prevention

### 5. Integration Tests
- **Full Booking Flow Test**: End-to-end test that books a slot and verifies the update

## 📊 Test Results & Assertions

Each test includes multiple assertions:
- ✅ **Status Code Validation**: Ensures correct HTTP status codes
- ✅ **Response Structure**: Validates JSON response format
- ✅ **Data Validation**: Checks required fields and data types
- ✅ **Business Logic**: Verifies booking rules and constraints
- ✅ **Performance**: Monitors response times
- ✅ **Error Handling**: Tests various error scenarios

## 🔧 Configuration

### Environment Variables
The environment file includes:
- `base_url`: `http://localhost:5000` (API server URL)
- `api_version`: `v1` (API version for future use)

### Collection Variables
- `available_slot_id`: Automatically set during test execution for dynamic testing

## 📝 API Endpoints Tested

| Method | Endpoint | Description | Test Cases |
|--------|----------|-------------|------------|
| GET | `/` | Health check | Server status |
| GET | `/api/slots` | Get all slots | Success, structure validation |
| GET | `/api/slots/:id` | Get specific slot | Success, not found |
| POST | `/api/slots/book` | Book a slot | Success, validation errors, conflicts |

## 🎯 Expected Test Results

When all tests pass, you should see:
- ✅ **12+ passing tests** covering all scenarios
- ✅ **No failing assertions**
- ✅ **Response times < 1000ms** for most endpoints
- ✅ **Proper error codes** (200, 400, 404) as expected

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure backend server is running on port 5000
   - Check if `http://localhost:5000` is accessible

2. **Tests Failing**
   - Verify the `slots.json` file contains the expected test data
   - Reset the database by restarting the server

3. **Environment Not Set**
   - Ensure "Slot Booking API Environment" is selected in Postman
   - Verify `base_url` is set to `http://localhost:5000`

### Resetting Test Data

If you need to reset the slots data to the original state:
```bash
# Stop the server (Ctrl+C)
# The slots.json file will be modified during testing
# You may want to backup/restore the original data if needed
```

## 🔄 Running Tests Programmatically

You can also run these tests from the command line using Newman (Postman's CLI):

```bash
# Install Newman
npm install -g newman

# Run the collection
newman run SlotBooking_API_Tests.postman_collection.json \
  -e SlotBooking_Environment.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export test-results.html
```

## 📋 Test Scenarios Covered

### Success Scenarios
- ✅ Retrieve all available slots
- ✅ Get individual slot details
- ✅ Successfully book an available slot
- ✅ Server health check

### Error Scenarios
- ❌ Get non-existent slot (404)
- ❌ Book with missing fields (400)
- ❌ Book non-existent slot (404)
- ❌ Book already booked slot (400)
- ❌ Empty request body validation (400)

### Data Validation
- 🔍 Response structure validation
- 🔍 Required field presence
- 🔍 Data type validation
- 🔍 Business rule enforcement

## 🚀 Advanced Usage

### Custom Test Data
To test with different data, modify the request bodies in the collection:
- Change slot IDs in the booking tests
- Modify user names and emails
- Adjust test data to match your specific scenarios

### Automated Testing
These tests can be integrated into CI/CD pipelines using Newman for automated API testing during development and deployment.

## 📞 Support

If you encounter any issues with these tests:
1. Check that the backend server is running correctly
2. Verify the API endpoints match the current implementation
3. Ensure all required dependencies are installed
4. Review the console output for detailed error messages

---

**Happy Testing! 🎉**