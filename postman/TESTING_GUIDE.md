# 🧪 Postman Testing Collection for Slot Booking API

## Overview
This directory contains a comprehensive testing suite for the Interview Slot Booking API backend. The tests are designed to work with tools like Postman, Newman (CLI), and direct command-line testing.

## 📁 What's Included

| File | Description |
|------|-------------|
| `SlotBooking_API_Tests.postman_collection.json` | Complete Postman collection with 12+ automated tests |
| `SlotBooking_Environment.postman_environment.json` | Environment configuration for local development |
| `test_api.sh` | Automated bash script for command-line testing |
| `curl_tests.md` | Manual cURL commands for individual endpoint testing |
| `README.md` | Detailed documentation and setup instructions |

## 🚀 Quick Start Options

### Option 1: Postman GUI (Recommended)
1. Start backend: `cd backend && npm start`
2. Import `SlotBooking_API_Tests.postman_collection.json` into Postman
3. Import `SlotBooking_Environment.postman_environment.json`
4. Select the environment and run the collection

### Option 2: Command Line Testing
```bash
# Make script executable (if needed)
chmod +x test_api.sh

# Run automated tests
./test_api.sh
```

### Option 3: Newman CLI
```bash
# Install Newman
npm install -g newman

# Run tests
newman run SlotBooking_API_Tests.postman_collection.json \
  -e SlotBooking_Environment.postman_environment.json
```

## ✅ Test Coverage

### Endpoints Tested
- ✅ `GET /` - Server health check
- ✅ `GET /api/slots` - Retrieve all slots
- ✅ `GET /api/slots/:id` - Get specific slot
- ✅ `POST /api/slots/book` - Book a slot

### Scenarios Covered
- ✅ **Success paths**: Valid requests returning expected data
- ✅ **Validation errors**: Missing fields, empty bodies
- ✅ **Not found errors**: Invalid slot IDs
- ✅ **Business logic**: Prevent double booking
- ✅ **Performance**: Response time validation
- ✅ **Integration**: End-to-end booking flow

### Test Results
When running the automated test script (`test_api.sh`):
```
==============================================
                 TEST SUMMARY
==============================================
Total Tests: 9
Passed: 9
Failed: 0

🎉 All tests passed! API is working correctly.
```

## 🔧 Configuration

### Environment Variables
- `base_url`: `http://localhost:5000` (default)
- `api_version`: `v1` (for future use)

### Prerequisites
- Node.js backend server running on port 5000
- Postman installed (for GUI testing)
- cURL and jq installed (for command-line testing)

## 📊 Test Features

### Automated Assertions
- HTTP status code validation
- Response structure validation
- Business rule verification
- Performance monitoring
- Error message validation

### Dynamic Testing
- Collection variables for slot IDs
- Environment-based configuration
- Reusable test patterns

## 🛠️ Troubleshooting

### Common Issues
1. **Server not responding**: Ensure backend is running on port 5000
2. **Tests failing**: Check if `slots.json` has been modified
3. **Environment issues**: Verify correct environment is selected in Postman

### Reset Instructions
```bash
# Stop and restart the backend server to reset data
cd backend
npm start
```

## 📈 Advanced Usage

### CI/CD Integration
These tests can be integrated into automated pipelines:
```bash
# Example GitHub Actions step
- name: Test API
  run: |
    cd backend && npm start &
    sleep 5
    cd ../postman && ./test_api.sh
```

### Custom Testing
- Modify request bodies for different test data
- Add new test cases to the collection
- Extend assertions for additional validation

## 📝 Sample Test Output

```bash
Testing: Book Slot - Success
Command: curl -s -X POST http://localhost:5000/api/slots/book -H 'Content-Type: application/json' -d '{"slotId": "slot-008", "name": "Test User", "email": "test@example.com"}'
Response: {"message":"Slot booked successfully","slot":{"slotId":"slot-008","status":"Booked","bookedName":"Test User","bookedEmail":"test@example.com"}}
✅ PASSED
```

## 🎯 Benefits

- **Comprehensive Coverage**: Tests all API endpoints and error cases
- **Easy to Use**: Multiple testing options for different preferences
- **Automated**: Can run unattended in CI/CD pipelines
- **Well Documented**: Clear instructions and examples
- **Maintainable**: Easy to extend and modify for new requirements

---

**Ready to test your API? Choose your preferred method above and start testing! 🚀**