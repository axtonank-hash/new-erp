#!/bin/bash

##############################################################################
#                                                                            #
#  College ERP Authentication API Test Suite                               #
#  Tests JWT authentication endpoints and protected routes                 #
#                                                                            #
##############################################################################

set -e

API_URL="${API_URL:-http://localhost:3000}"
ADMIN_EMAIL="admin@college.edu"
ADMIN_PASSWORD="password"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        College ERP Authentication API Test Suite${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

# Test Counter
TESTS_PASSED=0
TESTS_FAILED=0

##############################################################################
# Test 1: Health Check
##############################################################################
echo -e "${YELLOW}Test 1: API Health Check${NC}"
if curl -s -f http://localhost:3000/api/health &>/dev/null; then
  echo -e "${GREEN}✓ PASS${NC}: API is responding\n"
  ((TESTS_PASSED++))
else
  echo -e "${YELLOW}⚠ WARNING${NC}: Could not reach health endpoint\n"
fi

##############################################################################
# Test 2: Login with Valid Credentials
##############################################################################
echo -e "${YELLOW}Test 2: Login with Valid Credentials${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

echo "Response: $LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.tokens.accessToken' 2>/dev/null || echo "")

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ PASS${NC}: Login successful, token received\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC}: Could not obtain access token\n"
  ((TESTS_FAILED++))
  exit 1
fi

##############################################################################
# Test 3: Access Protected Route with Valid Token
##############################################################################
echo -e "${YELLOW}Test 3: Access Protected Route (GET /api/auth/me)${NC}"

ME_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $ME_RESPONSE" | jq '.' 2>/dev/null || echo "$ME_RESPONSE"

if echo "$ME_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ PASS${NC}: Protected route accessible with valid token\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC}: Could not access protected route\n"
  ((TESTS_FAILED++))
fi

##############################################################################
# Test 4: Access Protected Route without Token
##############################################################################
echo -e "${YELLOW}Test 4: Access Protected Route without Token (should fail)${NC}"

NO_TOKEN_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/me" \
  -H "Content-Type: application/json")

echo "Response: $NO_TOKEN_RESPONSE" | jq '.' 2>/dev/null || echo "$NO_TOKEN_RESPONSE"

if echo "$NO_TOKEN_RESPONSE" | grep -q "Unauthorized"; then
  echo -e "${GREEN}✓ PASS${NC}: Protected route blocked without token\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC}: Protected route should require authentication\n"
  ((TESTS_FAILED++))
fi

##############################################################################
# Test 5: Logout
##############################################################################
echo -e "${YELLOW}Test 5: Logout${NC}"

LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $LOGOUT_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGOUT_RESPONSE"

if echo "$LOGOUT_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ PASS${NC}: Logout successful\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC}: Logout failed\n"
  ((TESTS_FAILED++))
fi

##############################################################################
# Test 6: Login with Invalid Credentials
##############################################################################
echo -e "${YELLOW}Test 6: Login with Invalid Credentials (should fail)${NC}"

INVALID_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"wrongpassword\"}")

echo "Response: $INVALID_LOGIN" | jq '.' 2>/dev/null || echo "$INVALID_LOGIN"

if echo "$INVALID_LOGIN" | grep -q "Unauthorized"; then
  echo -e "${GREEN}✓ PASS${NC}: Invalid credentials rejected\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC}: Should reject invalid credentials\n"
  ((TESTS_FAILED++))
fi

##############################################################################
# Test 7: Login with Invalid Email
##############################################################################
echo -e "${YELLOW}Test 7: Login with Invalid Email (should fail)${NC}"

INVALID_EMAIL=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"nonexistent@example.com\",\"password\":\"password\"}")

echo "Response: $INVALID_EMAIL" | jq '.' 2>/dev/null || echo "$INVALID_EMAIL"

if echo "$INVALID_EMAIL" | grep -q "Unauthorized"; then
  echo -e "${GREEN}✓ PASS${NC}: Invalid email rejected\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC}: Should reject invalid email\n"
  ((TESTS_FAILED++))
fi

##############################################################################
# Test Summary
##############################################################################
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                      TEST SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

TOTAL=$((TESTS_PASSED + TESTS_FAILED))

echo -e "Tests Passed:  ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed:  ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests:   $TOTAL"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✓ All tests passed!${NC}\n"
  exit 0
else
  echo -e "\n${RED}✗ Some tests failed${NC}\n"
  exit 1
fi
