#!/bin/bash

# Admission Management API Integration Tests
# Comprehensive test suite for admission endpoints

set -e

API_URL="http://localhost:3000/api"
TOKEN=""
ADMISSION_ID=""
TEST_PASSED=0
TEST_FAILED=0
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================"
echo "Admission API Integration Tests"
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

# Test 2: Get all admissions
echo -n "Test 2: Get Admissions List... "
ADMISSIONS_LIST=$(curl -s -X GET "$API_URL/admissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$ADMISSIONS_LIST" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
  ADMISSION_ID=$(echo "$ADMISSIONS_LIST" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "  └─ Found $(echo "$ADMISSIONS_LIST" | grep -o '"total":[0-9]*' | cut -d':' -f2) applications"
  echo "  └─ First admission ID: $ADMISSION_ID"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  echo "Response: $ADMISSIONS_LIST"
  ((TEST_FAILED++))
fi

echo ""

# Test 3: Get admissions with filters
echo -n "Test 3: Get Admissions with Filters... "
FILTERED_ADMISSIONS=$(curl -s -X GET "$API_URL/admissions?status=pending&stream=Science" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$FILTERED_ADMISSIONS" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
  COUNT=$(echo "$FILTERED_ADMISSIONS" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  echo "  └─ Filtered results: $COUNT"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  ((TEST_FAILED++))
fi

echo ""

# Test 4: Get admission statistics
echo -n "Test 4: Get Admission Statistics... "
STATS_RESPONSE=$(curl -s -X GET "$API_URL/admissions/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$STATS_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
  TOTAL=$(echo "$STATS_RESPONSE" | grep -o '"total_applications":[0-9]*' | cut -d':' -f2)
  echo "  └─ Total applications: $TOTAL"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  ((TEST_FAILED++))
fi

echo ""

# Test 5: Get single admission
if [ -n "$ADMISSION_ID" ]; then
  echo -n "Test 5: Get Single Admission... "
  ADMISSION_DETAIL=$(curl -s -X GET "$API_URL/admissions/$ADMISSION_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

  if echo "$ADMISSION_DETAIL" | grep -q '"success":true'; then
    echo -e "${GREEN}PASSED${NC}"
    NAME=$(echo "$ADMISSION_DETAIL" | grep -o '"first_name":"[^"]*' | cut -d'"' -f4)
    echo "  └─ Applicant: $NAME"
    ((TEST_PASSED++))
  else
    echo -e "${RED}FAILED${NC}"
    ((TEST_FAILED++))
  fi
else
  echo -e "${YELLOW}SKIPPED${NC} (No admission ID available)"
fi

echo ""

# Test 6: Create new admission application
echo -n "Test 6: Create Admission Application... "
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/admissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Arun",
    "last_name": "Kumar",
    "email": "arun.kumar@student.com",
    "phone": "9876543240",
    "date_of_birth": "2006-12-10",
    "gender": "Male",
    "course_applied": "Class 11",
    "stream": "Commerce",
    "marks_10th": 85,
    "marks_12th": 0,
    "address": "789 Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  }')

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
  NEW_ADMISSION_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "  └─ Created admission ID: $NEW_ADMISSION_ID"
  ((TEST_PASSED++))
else
  echo -e "${RED}FAILED${NC}"
  echo "Response: $CREATE_RESPONSE"
  ((TEST_FAILED++))
fi

echo ""

# Test 7: Create admission - missing fields error check
echo -n "Test 7: Create Admission - Missing Fields (Error Check)... "
ERROR_RESPONSE=$(curl -s -X POST "$API_URL/admissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test"
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

# Test 8: Update admission
if [ -n "$ADMISSION_ID" ]; then
  echo -n "Test 8: Update Admission... "
  UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/admissions/$ADMISSION_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "phone": "9999999999",
      "stream": "Science"
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

# Test 9: Update admission status
if [ -n "$ADMISSION_ID" ]; then
  echo -n "Test 9: Update Admission Status... "
  STATUS_RESPONSE=$(curl -s -X PATCH "$API_URL/admissions/$ADMISSION_ID/status" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "approved"
    }')

  if echo "$STATUS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}PASSED${NC}"
    echo "  └─ Status updated successfully"
    ((TEST_PASSED++))
  else
    echo -e "${RED}FAILED${NC}"
    ((TEST_FAILED++))
  fi
else
  echo -e "${YELLOW}SKIPPED${NC}"
fi

echo ""

# Test 10: Unauthorized access - no token
echo -n "Test 10: Unauthorized Access - No Token... "
UNAUTH_RESPONSE=$(curl -s -X GET "$API_URL/admissions" \
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
