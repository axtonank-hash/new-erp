#!/bin/bash

# Student API Integration Tests
# Tests all student endpoints

BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@college.edu"
ADMIN_PASSWORD="password"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counters
PASSED=0
FAILED=0

echo "🧪 Running Student API Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Authenticate
echo "📍 Step 1: Authenticating admin user..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✅ Authentication successful${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Authentication failed${NC}"
  ((FAILED++))
  exit 1
fi
echo ""

# Step 2: Get all students
echo "📍 Step 2: Testing GET /api/students (list all)..."
STUDENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/students" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$STUDENTS_RESPONSE" | grep -q '"success":true'; then
  TOTAL=$(echo $STUDENTS_RESPONSE | grep -o '"total":[0-9]*' | cut -d':' -f2)
  echo -e "${GREEN}✅ Students list retrieved (Total: $TOTAL)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Failed to retrieve students list${NC}"
  ((FAILED++))
fi
echo ""

# Step 3: Get students with filter
echo "📍 Step 3: Testing students list with filter..."
FILTERED=$(curl -s -X GET "$BASE_URL/api/students?status=active&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$FILTERED" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Filtered students list retrieved${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Failed to retrieve filtered list${NC}"
  ((FAILED++))
fi
echo ""

# Step 4: Get single student
echo "📍 Step 4: Testing GET /api/students/[id]..."
STUDENT_ID=$(echo $STUDENTS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$STUDENT_ID" ]; then
  SINGLE=$(curl -s -X GET "$BASE_URL/api/students/$STUDENT_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$SINGLE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Single student retrieved${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ Failed to retrieve single student${NC}"
    ((FAILED++))
  fi
else
  echo -e "${YELLOW}⚠️ Skipped - No student ID found${NC}"
fi
echo ""

# Step 5: Create new student
echo "📍 Step 5: Testing POST /api/students (create)..."
NEW_STUDENT=$(curl -s -X POST "$BASE_URL/api/students" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Student",
    "email": "test.student@college.edu",
    "phone": "9876543212",
    "class_id": "class_10a",
    "section": "B",
    "address": "Test Address",
    "city": "Test City"
  }')

if echo "$NEW_STUDENT" | grep -q '"success":true'; then
  NEW_ID=$(echo $NEW_STUDENT | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Student created (ID: $NEW_ID)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Failed to create student${NC}"
  ((FAILED++))
fi
echo ""

# Step 6: Update student
if [ -n "$NEW_ID" ]; then
  echo "📍 Step 6: Testing PATCH /api/students/[id] (update)..."
  UPDATED=$(curl -s -X PATCH "$BASE_URL/api/students/$NEW_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"phone": "9876543213", "city": "Updated City"}')
  
  if echo "$UPDATED" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Student updated${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ Failed to update student${NC}"
    ((FAILED++))
  fi
  echo ""
fi

# Step 7: Get student grades
if [ -n "$STUDENT_ID" ]; then
  echo "📍 Step 7: Testing GET /api/students/[id]/grades..."
  GRADES=$(curl -s -X GET "$BASE_URL/api/students/$STUDENT_ID/grades" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$GRADES" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Student grades retrieved${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ Failed to retrieve student grades${NC}"
    ((FAILED++))
  fi
  echo ""
fi

# Step 8: Get student attendance
if [ -n "$STUDENT_ID" ]; then
  echo "📍 Step 8: Testing GET /api/students/[id]/attendance..."
  ATTENDANCE=$(curl -s -X GET "$BASE_URL/api/students/$STUDENT_ID/attendance" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$ATTENDANCE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Student attendance retrieved${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ Failed to retrieve student attendance${NC}"
    ((FAILED++))
  fi
  echo ""
fi

# Step 9: Delete student (created in step 5)
if [ -n "$NEW_ID" ]; then
  echo "📍 Step 9: Testing DELETE /api/students/[id]..."
  DELETED=$(curl -s -X DELETE "$BASE_URL/api/students/$NEW_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$DELETED" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Student deleted${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ Failed to delete student${NC}"
    ((FAILED++))
  fi
  echo ""
fi

# Step 10: Test unauthorized access
echo "📍 Step 10: Testing unauthorized access (should fail)..."
UNAUTHORIZED=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/students" \
  -H "Authorization: Bearer invalid_token")

if [ "$UNAUTHORIZED" = "401" ]; then
  echo -e "${GREEN}✅ Correctly rejected unauthorized access${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Should have rejected unauthorized access${NC}"
  ((FAILED++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✨ All $TOTAL tests passed! (${SUCCESS_RATE}%)${NC}"
  exit 0
else
  echo -e "${RED}❌ $FAILED tests failed (${SUCCESS_RATE}% success)${NC}"
  exit 1
fi
