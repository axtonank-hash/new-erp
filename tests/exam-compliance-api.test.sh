#!/bin/bash

# Phase 4: Examination & Compliance API Integration Tests
# Tests for exams, results, analytics, and compliance endpoints

set -e
API_URL="http://localhost:8000/api/v2/exam-compliance"
TOKEN=""
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Authenticate (replace with valid credentials)
echo -n "Authenticating... "
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@college.edu", "password": "password"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo -e "${RED}FAILED${NC}"
  exit 1
else
  echo -e "${GREEN}OK${NC}"
fi

# Test: Create Exam
EXAM_PAYLOAD='{"program_id":1,"semester":1,"exam_type":"internal","exam_date":"2026-03-01","max_marks":100,"passing_marks":40}'
echo -n "Creating exam... "
CREATE_EXAM=$(curl -s -X POST "$API_URL/exams" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$EXAM_PAYLOAD")
if echo "$CREATE_EXAM" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
else
  echo -e "${RED}FAILED${NC}"
  echo "$CREATE_EXAM"
fi

# Test: List Exams
echo -n "Listing exams... "
LIST_EXAMS=$(curl -s -X GET "$API_URL/exams" -H "Authorization: Bearer $TOKEN")
if echo "$LIST_EXAMS" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
else
  echo -e "${RED}FAILED${NC}"
  echo "$LIST_EXAMS"
fi

# Test: Create Compliance Audit
AUDIT_PAYLOAD='{"audit_type":"clinical_hours","audit_date":"2026-02-03","compliance_status":"pending"}'
echo -n "Creating compliance audit... "
CREATE_AUDIT=$(curl -s -X POST "$API_URL/compliance/audits" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$AUDIT_PAYLOAD")
if echo "$CREATE_AUDIT" | grep -q '"success":true'; then
  echo -e "${GREEN}PASSED${NC}"
else
  echo -e "${RED}FAILED${NC}"
  echo "$CREATE_AUDIT"
fi

# Add more tests as needed for results, analytics, matrices, etc.
