# Slot Booking API - cURL Test Commands

This file contains ready-to-use cURL commands for testing the Slot Booking API directly from the command line.

## Prerequisites
- Backend server running on `http://localhost:5000`
- `curl` and `jq` installed for JSON formatting

## Test Commands

### 1. Health Check
```bash
curl -s http://localhost:5000/
```

### 2. Get All Slots
```bash
curl -s http://localhost:5000/api/slots | jq '.'
```

### 3. Get Specific Slot by ID
```bash
# Get existing slot
curl -s http://localhost:5000/api/slots/slot-001 | jq '.'

# Get non-existent slot (should return 404)
curl -s http://localhost:5000/api/slots/invalid-slot | jq '.'
```

### 4. Book Slot - Success Cases
```bash
# Book an available slot
curl -s -X POST http://localhost:5000/api/slots/book \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "slot-005",
    "name": "John Doe",
    "email": "john.doe@example.com"
  }' | jq '.'
```

### 5. Book Slot - Error Cases
```bash
# Missing required fields
curl -s -X POST http://localhost:5000/api/slots/book \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "slot-001",
    "name": "Jane Doe"
  }' | jq '.'

# Empty body
curl -s -X POST http://localhost:5000/api/slots/book \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

# Non-existent slot
curl -s -X POST http://localhost:5000/api/slots/book \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "invalid-slot",
    "name": "Test User",
    "email": "test@example.com"
  }' | jq '.'

# Try to book already booked slot (run after booking slot-005)
curl -s -X POST http://localhost:5000/api/slots/book \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "slot-005",
    "name": "Another User",
    "email": "another@example.com"
  }' | jq '.'
```

### 6. Integration Test - Book and Verify
```bash
# Book a slot
echo "Booking slot-006..."
curl -s -X POST http://localhost:5000/api/slots/book \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "slot-006",
    "name": "Integration Test",
    "email": "integration@test.com"
  }' | jq '.'

echo "Verifying slot-006 is booked..."
curl -s http://localhost:5000/api/slots/slot-006 | jq '.'
```

### 7. Performance Test
```bash
# Test response time
time curl -s http://localhost:5000/api/slots > /dev/null
```

## Expected Responses

### Successful Booking
```json
{
  "message": "Slot booked successfully",
  "slot": {
    "slotId": "slot-005",
    "date": "2025-09-10",
    "startTime": "09:00",
    "endTime": "10:00",
    "status": "Booked",
    "bookedName": "John Doe",
    "bookedEmail": "john.doe@example.com"
  }
}
```

### Validation Error
```json
{
  "message": "SlotID, name, and email are required"
}
```

### Not Found Error
```json
{
  "message": "Slot not found"
}
```

### Already Booked Error
```json
{
  "message": "This slot is already booked"
}
```

## Batch Testing Script

Save this as `test_api.sh` and run with `bash test_api.sh`:

```bash
#!/bin/bash
echo "=== Slot Booking API Test Suite ==="
echo "Testing server health..."
curl -s http://localhost:5000/

echo -e "\n\nTesting get all slots..."
curl -s http://localhost:5000/api/slots | jq '.[:2]'

echo -e "\n\nTesting get specific slot..."
curl -s http://localhost:5000/api/slots/slot-001 | jq '.'

echo -e "\n\nTesting successful booking..."
curl -s -X POST http://localhost:5000/api/slots/book \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "slot-007",
    "name": "Test User",
    "email": "test@example.com"
  }' | jq '.'

echo -e "\n\nTesting validation error..."
curl -s -X POST http://localhost:5000/api/slots/book \
  -H "Content-Type: application/json" \
  -d '{"name": "Incomplete"}' | jq '.'

echo -e "\n\nAll tests completed!"
```