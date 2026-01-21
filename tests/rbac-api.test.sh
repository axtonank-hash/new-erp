#!/bin/bash

# RBAC API Integration Tests
# Tests RBAC endpoints and permission enforcement

BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@college.edu"
ADMIN_PASSWORD="password"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

echo "🧪 Running RBAC Integration Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check API Health
echo "📍 Step 1: Checking API Health..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$API_HEALTH" = "200" ]; then
  echo -e "${GREEN}✅ API is healthy${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ API is not responding (Status: $API_HEALTH)${NC}"
  ((FAILED++))
fi
echo ""

# Step 2: Login and get token
echo "📍 Step 2: Authenticating admin user..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✅ Authentication successful${NC}"
  echo "   Token: ${ACCESS_TOKEN:0:20}..."
  ((PASSED++))
else
  echo -e "${RED}❌ Authentication failed${NC}"
  echo "   Response: $LOGIN_RESPONSE"
  ((FAILED++))
  exit 1
fi
echo ""

# Step 3: Get User's Permissions
echo "📍 Step 3: Testing /api/rbac/permissions (my-permissions)..."
PERMS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/rbac/permissions?action=my-permissions" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

PERM_COUNT=$(echo $PERMS_RESPONSE | grep -o '"permission_count":[0-9]*' | cut -d':' -f2)

if [ "$PERM_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ User permissions retrieved (Count: $PERM_COUNT)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Failed to retrieve user permissions${NC}"
  echo "   Response: $PERMS_RESPONSE"
  ((FAILED++))
fi
echo ""

# Step 4: Test without authorization
echo "📍 Step 4: Testing RBAC endpoint without token (should fail)..."
NO_AUTH_RESPONSE=$(curl -s -X GET "$BASE_URL/api/rbac/permissions?action=my-permissions" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✅ Correctly rejected unauthorized request${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Should have rejected unauthorized request (Got: $HTTP_CODE)${NC}"
  ((FAILED++))
fi
echo ""

# Step 5: Test all-roles action
echo "📍 Step 5: Testing /api/rbac/permissions?action=all-roles..."
ALL_ROLES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/rbac/permissions?action=all-roles" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

SUPER_ADMIN_COUNT=$(echo $ALL_ROLES_RESPONSE | grep -o '"permission_count":[0-9]*' | head -1 | cut -d':' -f2)

if [ "$SUPER_ADMIN_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ All roles retrieved successfully${NC}"
  echo "   Super Admin Permissions: $SUPER_ADMIN_COUNT"
  ((PASSED++))
else
  echo -e "${RED}❌ Failed to retrieve all roles${NC}"
  ((FAILED++))
fi
echo ""

# Step 6: Test categories action
echo "📍 Step 6: Testing /api/rbac/permissions?action=categories..."
CATEGORIES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/rbac/permissions?action=categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$CATEGORIES_RESPONSE" | grep -q '"users"'; then
  echo -e "${GREEN}✅ Permission categories retrieved${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Failed to retrieve permission categories${NC}"
  ((FAILED++))
fi
echo ""

# Step 7: Test specific role permissions
echo "📍 Step 7: Testing specific role permissions (faculty)..."
FACULTY_PERMS=$(curl -s -X GET "$BASE_URL/api/rbac/permissions?action=role-permissions&role=faculty" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

FACULTY_COUNT=$(echo $FACULTY_PERMS | grep -o '"permission_count":[0-9]*' | cut -d':' -f2)

if [ "$FACULTY_COUNT" -gt 0 ] && [ "$FACULTY_COUNT" -lt "$PERM_COUNT" ]; then
  echo -e "${GREEN}✅ Faculty permissions retrieved (Count: $FACULTY_COUNT)${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Failed to retrieve faculty permissions correctly${NC}"
  ((FAILED++))
fi
echo ""

# Step 8: Test invalid role
echo "📍 Step 8: Testing invalid role (should return 0 permissions)..."
INVALID_ROLE=$(curl -s -X GET "$BASE_URL/api/rbac/permissions?action=role-permissions&role=invalid_role" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$INVALID_ROLE" | grep -q '"permission_count":0'; then
  echo -e "${GREEN}✅ Correctly returned 0 permissions for invalid role${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Failed to handle invalid role${NC}"
  ((FAILED++))
fi
echo ""

# Step 9: Test missing role parameter
echo "📍 Step 9: Testing missing role parameter (should error)..."
MISSING_ROLE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/rbac/permissions?action=role-permissions" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [ "$MISSING_ROLE" = "400" ]; then
  echo -e "${GREEN}✅ Correctly rejected missing role parameter${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Should have rejected missing role parameter (Got: $MISSING_ROLE)${NC}"
  ((FAILED++))
fi
echo ""

# Step 10: Test invalid action
echo "📍 Step 10: Testing invalid action (should error)..."
INVALID_ACTION=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/rbac/permissions?action=invalid_action" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [ "$INVALID_ACTION" = "400" ]; then
  echo -e "${GREEN}✅ Correctly rejected invalid action${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Should have rejected invalid action (Got: $INVALID_ACTION)${NC}"
  ((FAILED++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✨ All $TOTAL tests passed! (${SUCCESS_RATE}%)${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
else
  echo -e "${RED}❌ $FAILED tests failed (${SUCCESS_RATE}% success)${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
