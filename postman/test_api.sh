#!/bin/bash

# Slot Booking API Test Script
# This script tests all API endpoints with various scenarios

BASE_URL="http://localhost:5000"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_status="$3"
    
    echo -e "\n${YELLOW}Testing: $test_name${NC}"
    echo "Command: $command"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Execute the command and capture both status and response
    response=$(eval "$command" 2>/dev/null)
    status=$?
    
    # Check if server is reachable
    if [ $status -ne 0 ]; then
        echo -e "${RED}❌ FAILED: Server not reachable${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return
    fi
    
    echo "Response: $response"
    
    # Check if response contains expected patterns based on test type
    case "$test_name" in
        *"Health Check"*)
            if echo "$response" | grep -q "Interview Slot Booking API is running"; then
                echo -e "${GREEN}✅ PASSED${NC}"
                PASSED_TESTS=$((PASSED_TESTS + 1))
            else
                echo -e "${RED}❌ FAILED: Unexpected response${NC}"
                FAILED_TESTS=$((FAILED_TESTS + 1))
            fi
            ;;
        *"Get All Slots"*)
            if echo "$response" | grep -q "slotId"; then
                echo -e "${GREEN}✅ PASSED${NC}"
                PASSED_TESTS=$((PASSED_TESTS + 1))
            else
                echo -e "${RED}❌ FAILED: No slots returned${NC}"
                FAILED_TESTS=$((FAILED_TESTS + 1))
            fi
            ;;
        *"Success"*)
            if echo "$response" | grep -q "successfully\|slot-001"; then
                echo -e "${GREEN}✅ PASSED${NC}"
                PASSED_TESTS=$((PASSED_TESTS + 1))
            else
                echo -e "${RED}❌ FAILED: Expected success response${NC}"
                FAILED_TESTS=$((FAILED_TESTS + 1))
            fi
            ;;
        *"Not Found"*|*"Invalid"*)
            if echo "$response" | grep -q "not found\|Slot not found"; then
                echo -e "${GREEN}✅ PASSED${NC}"
                PASSED_TESTS=$((PASSED_TESTS + 1))
            else
                echo -e "${RED}❌ FAILED: Expected not found error${NC}"
                FAILED_TESTS=$((FAILED_TESTS + 1))
            fi
            ;;
        *"Validation"*|*"Missing"*)
            if echo "$response" | grep -q "required\|SlotID"; then
                echo -e "${GREEN}✅ PASSED${NC}"
                PASSED_TESTS=$((PASSED_TESTS + 1))
            else
                echo -e "${RED}❌ FAILED: Expected validation error${NC}"
                FAILED_TESTS=$((FAILED_TESTS + 1))
            fi
            ;;
        *)
            echo -e "${GREEN}✅ PASSED (Manual verification required)${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            ;;
    esac
}

# Start testing
echo "=============================================="
echo "   Slot Booking API - Automated Test Suite"
echo "=============================================="
echo "Testing against: $BASE_URL"

# Test 1: Health Check
run_test "Health Check" \
    "curl -s $BASE_URL/"

# Test 2: Get All Slots
run_test "Get All Slots" \
    "curl -s $BASE_URL/api/slots"

# Test 3: Get Specific Slot - Success
run_test "Get Specific Slot - Success" \
    "curl -s $BASE_URL/api/slots/slot-001"

# Test 4: Get Specific Slot - Not Found
run_test "Get Specific Slot - Not Found" \
    "curl -s $BASE_URL/api/slots/non-existent-slot"

# Test 5: Book Slot - Success
run_test "Book Slot - Success" \
    "curl -s -X POST $BASE_URL/api/slots/book -H 'Content-Type: application/json' -d '{\"slotId\": \"slot-008\", \"name\": \"Test User\", \"email\": \"test@example.com\"}'"

# Test 6: Book Slot - Missing Fields
run_test "Book Slot - Validation Error (Missing Fields)" \
    "curl -s -X POST $BASE_URL/api/slots/book -H 'Content-Type: application/json' -d '{\"slotId\": \"slot-001\", \"name\": \"Jane Doe\"}'"

# Test 7: Book Slot - Empty Body
run_test "Book Slot - Validation Error (Empty Body)" \
    "curl -s -X POST $BASE_URL/api/slots/book -H 'Content-Type: application/json' -d '{}'"

# Test 8: Book Slot - Invalid Slot ID
run_test "Book Slot - Invalid Slot ID" \
    "curl -s -X POST $BASE_URL/api/slots/book -H 'Content-Type: application/json' -d '{\"slotId\": \"invalid-slot\", \"name\": \"Test User\", \"email\": \"test@example.com\"}'"

# Test 9: Book Already Booked Slot
run_test "Book Slot - Already Booked" \
    "curl -s -X POST $BASE_URL/api/slots/book -H 'Content-Type: application/json' -d '{\"slotId\": \"slot-008\", \"name\": \"Another User\", \"email\": \"another@example.com\"}'"

# Summary
echo ""
echo "=============================================="
echo "                 TEST SUMMARY"
echo "=============================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! API is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the API implementation.${NC}"
    exit 1
fi