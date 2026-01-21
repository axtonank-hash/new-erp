#!/bin/bash

# Attendance Management API Integration Tests
# Comprehensive test suite for attendance endpoints

set -e

API_URL="http://localhost:3000/api"
TOKEN=""
STUDENT_ID="student_001"
ATTENDANCE_ID=""
TEST_PASSED=0
TEST_FAILED=0
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================"
echo "Attendance API Integration Tests"
echo "================================"
echo ""

# Test 1: Login to get token
echo -n "Test 1: Authentication (Login)... "
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "password"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}FAILED${NC}"
  echo "Response: $LOGIN_RESPONSE"
  ((TEST_FAILED++))
else
  echo -e "${GREEN}PASSED${NC}"
  ((TEST_PASSED++))
fi

echo ""

# Test 2: Get all attendance records
echo -n "Test 2: Get Attendance List... "
ATTENDANCE_LIST=$(curl -s -X GET "$API_URL/attendance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$ATTENDANCE_LIST" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
  ATTENDANCE_ID=$(echo "$ATTENDANCE_LIST" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  TOTAL=$(echo "$ATTENDANCE_LIST" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  echo "  └─ Found $TOTAL attendance records"
  echo "  └─ First attendance ID: $ATTENDANCE_ID"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  echo "Response: $ATTENDANCE_LIST"
  ((TEST_FAILED++))
fi

echo ""

# Test 3: Get attendance with filters
echo -n "Test 3: Get Attendance with Filters... "
FILTERED_ATTENDANCE=$(curl -s -X GET "$API_URL/attendance?student_id=$STUDENT_ID&status=present" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$FILTERED_ATTENDANCE" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
  COUNT=$(echo "$FILTERED_ATTENDANCE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  echo "  └─ Filtered results: $COUNT"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  ((TEST_FAILED++))
fi

echo ""

# Test 4: Get single attendance record
if [ -n "$ATTENDANCE_ID" ]; then
  echo -n "Test 4: Get Single Attendance Record... "
  ATTENDANCE_DETAIL=$(curl -s -X GET "$API_URL/attendance/$ATTENDANCE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

  if echo "$ATTENDANCE_DETAIL" | grep -q '"success":true'; then
    echo -e "${GREEN}PASSED${NC}"
    STATUS=$(echo "$ATTENDANCE_DETAIL" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    echo "  └─ Attendance status: $STATUS"
    ((TEST_PASSED++))
  else
    echo -e "${RED}FAILED${NC}"
    ((TEST_FAILED++))
  fi
else
  echo -e "${YELLOW}SKIPPED${NC} (No attendance ID available)"
fi

echo ""

# Test 5: Mark attendance for single student
echo -n "Test 5: Mark Attendance (Single Student)... "
MARK_RESPONSE=$(curl -s -X POST "$API_URL/attendance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "student_003",
    "date": "2024-01-21",
    "status": "present",
    "class_id": "class_12a",
    "subject": "Chemistry",
    "remarks": "Present"
  }')

if echo "$MARK_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
  NEW_ATT_ID=$(echo "$MARK_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "  └─ Created attendance ID: $NEW_ATT_ID"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  echo "Response: $MARK_RESPONSE"
  ((TEST_FAILED++))
fi

echo ""

# Test 6: Mark attendance - missing fields error check
echo -n "Test 6: Mark Attendance - Missing Fields (Error Check)... "
ERROR_RESPONSE=$(curl -s -X POST "$API_URL/attendance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "student_001"
  }')

if echo "$ERROR_RESPONSE" | grep -q '"success":false'; then
  echo -e "${GREEN}PASSED${NC}"
  echo "  └─ Properly rejected invalid data"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  ((TEST_FAILED++))
fi

echo ""

# Test 7: Bulk mark attendance
echo -n "Test 7: Bulk Mark Attendance... "
BULK_RESPONSE=$(curl -s -X POST "$API_URL/attendance/bulk" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": "class_12b",
    "date": "2024-01-21",
    "subject": "Biology",
    "students": [
      {
        "student_id": "student_004",
        "status": "present",
        "remarks": "Present"
      },
      {
        "student_id": "student_005",
        "status": "absent",
        "remarks": "No leave"
      },
      {
        "student_id": "student_006",
        "status": "late",
        "remarks": "Late by 10 min"
      }
    ]
  }')

if echo "$BULK_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
  COUNT=$(echo "$BULK_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  └─ Marked attendance for $COUNT students"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  echo "Response: $BULK_RESPONSE"
  ((TEST_FAILED++))
fi

echo ""

# Test 8: Update attendance record
if [ -n "$ATTENDANCE_ID" ]; then
  echo -n "Test 8: Update Attendance Record... "
  UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/attendance/$ATTENDANCE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "late",
      "remarks": "Arrived late due to traffic"
    }')

  if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}PASSED${NC}"
    ((TEST_PASSED++))
  else
    echo -e "${RED}FAILED${NC}"
    ((TEST_FAILED++))
  fi
else
  echo -e "${YELLOW}SKIPPED${NC}"
fi

echo ""

# Test 9: Get student attendance summary
echo -n "Test 9: Get Student Attendance Summary... "
SUMMARY_RESPONSE=$(curl -s -X GET "$API_URL/attendance/student/$STUDENT_ID/summary" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$SUMMARY_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
  TOTAL=$(echo "$SUMMARY_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  PERCENTAGE=$(echo "$SUMMARY_RESPONSE" | grep -o '"attendance_percentage":[0-9]*' | cut -d':' -f2)
  echo "  └─ Total attendance records: $TOTAL"
  echo "  └─ Attendance percentage: $PERCENTAGE%"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  ((TEST_FAILED++))
fi

echo ""

# Test 10: Test unauthorized access (without token)
echo -n "Test 10: Unauthorized Access - No Token... "
UNAUTH_RESPONSE=$(curl -s -X GET "$API_URL/attendance" \
  -H "Content-Type: application/json")

if echo "$UNAUTH_RESPONSE" | grep -q '"error":"Authentication required"'; then
  echo -e "${GREEN}PASSED${NC}"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  ((TEST_FAILED++))
fi

echo ""

# Test Summary
echo "================================"
echo "Test Summary"
echo "================================"
echo -e "${GREEN}Passed: $TEST_PASSED${NC}"
echo -e "${RED}Failed: $TEST_FAILED${NC}"
TOTAL=$((TEST_PASSED + TEST_FAILED))
echo "Total: $TOTAL"
echo ""

if [ $TEST_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
