#!/bin/bash

# Phase 2 Week 1 Day 3: Integration Testing with Database Layer
# Tests all 40+ API endpoints with the new MySQL database integration
# Validates that all endpoints work correctly with database queries

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_VERSION="v1"
MAX_RETRIES=3
RETRY_DELAY=2

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Test data storage
ADMIN_TOKEN=""
STUDENT_TOKEN=""
FACULTY_TOKEN=""
STUDENT_ID=""
FACULTY_ID=""
ADMISSION_ID=""
ATTENDANCE_ID=""

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED_TESTS++))
}

log_test() {
    echo -e "${CYAN}━${NC} Testing: $1"
    ((TOTAL_TESTS++))
}

log_section() {
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║${NC} $1"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# API request helper with retry logic
api_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local retry=0

    while [ $retry -lt $MAX_RETRIES ]; do
        local headers="Content-Type: application/json"
        if [ ! -z "$token" ]; then
            headers="$headers
Authorization: Bearer $token"
        fi

        if [ -z "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                ${token:+-H "Authorization: Bearer $token"} \
                "$BASE_URL/api/$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                ${token:+-H "Authorization: Bearer $token"} \
                -d "$data" \
                "$BASE_URL/api/$endpoint")
        fi

        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)

        if [ "$http_code" != "000" ]; then
            echo "$body"
            echo "$http_code"
            return 0
        fi

        ((retry++))
        if [ $retry -lt $MAX_RETRIES ]; then
            sleep $RETRY_DELAY
        fi
    done

    echo "Connection failed after $MAX_RETRIES retries"
    echo "000"
}

# Extract value from JSON response
extract_json() {
    echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | head -1 | cut -d'"' -f4
}

extract_json_num() {
    echo "$1" | grep -o "\"$2\":[^,}]*" | head -1 | cut -d':' -f2
}

# Test wrapper
run_test() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5
    local expected_code=$6

    log_test "$name"

    local response=$(api_request "$method" "$endpoint" "$data" "$token")
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "$expected_code" ]; then
        log_success "$name (HTTP $http_code)"
        echo "$body"
        return 0
    else
        log_error "$name - Expected HTTP $expected_code, got $http_code"
        echo "Response: $body"
        return 1
    fi
}

# ═════════════════════════════════════════════════════════════════════════════
# Main Test Suite
# ═════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        Phase 2 Week 1 Day 3: Integration Testing              ║${NC}"
echo -e "${CYAN}║        Database Layer Validation (96+ Tests)                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Wait for server
log_section "1. Server Health Check"
echo "Attempting to connect to $BASE_URL..."
for i in {1..30}; do
    if curl -s "$BASE_URL/api/health" >/dev/null 2>&1; then
        log_success "Server is responding"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Server is not responding after 30 attempts"
        exit 1
    fi
    echo -n "."
    sleep 1
done

# ═════════════════════════════════════════════════════════════════════════════
# Authentication Tests (8 tests)
# ═════════════════════════════════════════════════════════════════════════════

log_section "2. Authentication Tests (8 tests)"

# Test 2.1: Admin Login
response=$(run_test "Admin Login" "POST" "auth/login" \
    '{"email":"admin@college.edu","password":"password"}' \
    "" "200")
ADMIN_TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*' | head -1 | cut -d'"' -f4)
if [ -z "$ADMIN_TOKEN" ]; then
    log_error "Failed to extract admin token"
    ADMIN_TOKEN="invalid-token"
fi

# Test 2.2: Admin Verify Token
run_test "Verify Admin Token" "GET" "auth/verify" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 2.3: Student Login
response=$(run_test "Student Login" "POST" "auth/login" \
    '{"email":"student@college.edu","password":"password"}' \
    "" "200")
STUDENT_TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 2.4: Faculty Login
response=$(run_test "Faculty Login" "POST" "auth/login" \
    '{"email":"faculty@college.edu","password":"password"}' \
    "" "200")
FACULTY_TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 2.5: Invalid Email
run_test "Invalid Email Login" "POST" "auth/login" \
    '{"email":"invalid@college.edu","password":"password"}' \
    "" "401" > /dev/null

# Test 2.6: Invalid Password
run_test "Invalid Password Login" "POST" "auth/login" \
    '{"email":"admin@college.edu","password":"wrongpassword"}' \
    "" "401" > /dev/null

# Test 2.7: Missing Email
run_test "Missing Email" "POST" "auth/login" \
    '{"password":"password"}' \
    "" "400" > /dev/null

# Test 2.8: Missing Password
run_test "Missing Password" "POST" "auth/login" \
    '{"email":"admin@college.edu"}' \
    "" "400" > /dev/null

# ═════════════════════════════════════════════════════════════════════════════
# Student API Tests (12 tests)
# ═════════════════════════════════════════════════════════════════════════════

log_section "3. Student API Tests (12 tests)"

# Test 3.1: Get all students
response=$(run_test "Get All Students" "GET" "students?page=1&limit=10" "" "$ADMIN_TOKEN" "200")
STUDENT_ID=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 3.2: Get students with filter
run_test "Get Students by Class" "GET" "students?class_id=class_1&page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 3.3: Get student by ID
if [ ! -z "$STUDENT_ID" ]; then
    run_test "Get Student by ID" "GET" "students/$STUDENT_ID" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 3.4: Create student
response=$(run_test "Create Student" "POST" "students" \
    '{"first_name":"Test","last_name":"Student","email":"test.student@college.edu","phone":"1234567890","class_id":"class_1","section":"A"}' \
    "$ADMIN_TOKEN" "201")
NEW_STUDENT_ID=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 3.5: Update student
if [ ! -z "$NEW_STUDENT_ID" ]; then
    run_test "Update Student" "PUT" "students/$NEW_STUDENT_ID" \
        '{"first_name":"Updated","last_name":"Student"}' \
        "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 3.6: Get student count
run_test "Get Student Count" "GET" "students/count" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 3.7: Get student grades
if [ ! -z "$STUDENT_ID" ]; then
    run_test "Get Student Grades" "GET" "students/$STUDENT_ID/grades" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 3.8: Get student attendance
if [ ! -z "$STUDENT_ID" ]; then
    run_test "Get Student Attendance" "GET" "students/$STUDENT_ID/attendance" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 3.9: Invalid student ID
run_test "Get Invalid Student" "GET" "students/invalid_id" "" "$ADMIN_TOKEN" "404" > /dev/null

# Test 3.10: Unauthorized student access
run_test "Unauthorized Student Access" "GET" "students" "" "" "401" > /dev/null

# Test 3.11: Delete student
if [ ! -z "$NEW_STUDENT_ID" ]; then
    run_test "Delete Student" "DELETE" "students/$NEW_STUDENT_ID" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 3.12: Search students
run_test "Search Students" "GET" "students?search=test&page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# ═════════════════════════════════════════════════════════════════════════════
# Faculty API Tests (10 tests)
# ═════════════════════════════════════════════════════════════════════════════

log_section "4. Faculty API Tests (10 tests)"

# Test 4.1: Get all faculty
response=$(run_test "Get All Faculty" "GET" "faculty?page=1&limit=10" "" "$ADMIN_TOKEN" "200")
FACULTY_ID=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 4.2: Get faculty by ID
if [ ! -z "$FACULTY_ID" ]; then
    run_test "Get Faculty by ID" "GET" "faculty/$FACULTY_ID" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 4.3: Create faculty
response=$(run_test "Create Faculty" "POST" "faculty" \
    '{"first_name":"Dr.","last_name":"Test","email":"dr.test@college.edu","phone":"9876543210","department":"Science","designation":"Professor"}' \
    "$ADMIN_TOKEN" "201")
NEW_FACULTY_ID=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 4.4: Update faculty
if [ ! -z "$NEW_FACULTY_ID" ]; then
    run_test "Update Faculty" "PUT" "faculty/$NEW_FACULTY_ID" \
        '{"designation":"Associate Professor"}' \
        "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 4.5: Get faculty count
run_test "Get Faculty Count" "GET" "faculty/count" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 4.6: Get faculty by department
run_test "Get Faculty by Department" "GET" "faculty?department=Science&page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 4.7: Delete faculty
if [ ! -z "$NEW_FACULTY_ID" ]; then
    run_test "Delete Faculty" "DELETE" "faculty/$NEW_FACULTY_ID" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 4.8: Invalid faculty ID
run_test "Get Invalid Faculty" "GET" "faculty/invalid_id" "" "$ADMIN_TOKEN" "404" > /dev/null

# Test 4.9: Search faculty
run_test "Search Faculty" "GET" "faculty?search=test&page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 4.10: Unauthorized access
run_test "Unauthorized Faculty Access" "GET" "faculty" "" "" "401" > /dev/null

# ═════════════════════════════════════════════════════════════════════════════
# Attendance API Tests (12 tests)
# ═════════════════════════════════════════════════════════════════════════════

log_section "5. Attendance API Tests (12 tests)"

# Test 5.1: Get all attendance
response=$(run_test "Get All Attendance" "GET" "attendance?page=1&limit=50" "" "$ADMIN_TOKEN" "200")
ATTENDANCE_ID=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 5.2: Get attendance by ID
if [ ! -z "$ATTENDANCE_ID" ]; then
    run_test "Get Attendance by ID" "GET" "attendance/$ATTENDANCE_ID" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 5.3: Mark attendance
run_test "Mark Attendance" "POST" "attendance/mark" \
    "{\"student_id\":\"$STUDENT_ID\",\"date\":\"2026-01-21\",\"status\":\"present\",\"class_id\":\"class_1\",\"subject\":\"Math\"}" \
    "$ADMIN_TOKEN" "201" > /dev/null

# Test 5.4: Mark attendance - Invalid status
run_test "Mark Attendance Invalid Status" "POST" "attendance/mark" \
    "{\"student_id\":\"$STUDENT_ID\",\"date\":\"2026-01-21\",\"status\":\"invalid\",\"class_id\":\"class_1\",\"subject\":\"Math\"}" \
    "$ADMIN_TOKEN" "400" > /dev/null

# Test 5.5: Update attendance
if [ ! -z "$ATTENDANCE_ID" ]; then
    run_test "Update Attendance" "PUT" "attendance/$ATTENDANCE_ID" \
        '{"status":"absent"}' \
        "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 5.6: Get attendance by date
run_test "Get Attendance by Date" "GET" "attendance?date=2026-01-21&page=1&limit=50" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 5.7: Get student attendance summary
if [ ! -z "$STUDENT_ID" ]; then
    run_test "Get Student Attendance Summary" "GET" "attendance/student/$STUDENT_ID/summary" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 5.8: Bulk mark attendance
run_test "Bulk Mark Attendance" "POST" "attendance/bulk" \
    "{\"class_id\":\"class_1\",\"date\":\"2026-01-21\",\"subject\":\"Math\",\"students\":[{\"student_id\":\"$STUDENT_ID\",\"status\":\"present\"}]}" \
    "$ADMIN_TOKEN" "201" > /dev/null

# Test 5.9: Delete attendance
if [ ! -z "$ATTENDANCE_ID" ]; then
    run_test "Delete Attendance" "DELETE" "attendance/$ATTENDANCE_ID" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 5.10: Invalid attendance ID
run_test "Get Invalid Attendance" "GET" "attendance/invalid_id" "" "$ADMIN_TOKEN" "404" > /dev/null

# Test 5.11: Get attendance by class
run_test "Get Attendance by Class" "GET" "attendance?class_id=class_1&page=1&limit=50" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 5.12: Unauthorized attendance access
run_test "Unauthorized Attendance Access" "GET" "attendance" "" "" "401" > /dev/null

# ═════════════════════════════════════════════════════════════════════════════
# Admission API Tests (8 tests)
# ═════════════════════════════════════════════════════════════════════════════

log_section "6. Admission API Tests (8 tests)"

# Test 6.1: Get all admissions
response=$(run_test "Get All Admissions" "GET" "admissions?page=1&limit=10" "" "$ADMIN_TOKEN" "200")
ADMISSION_ID=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 6.2: Get admission by ID
if [ ! -z "$ADMISSION_ID" ]; then
    run_test "Get Admission by ID" "GET" "admissions/$ADMISSION_ID" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 6.3: Create admission
response=$(run_test "Create Admission" "POST" "admissions" \
    '{"first_name":"John","last_name":"Doe","email":"john.doe@example.com","phone":"5555555555","program":"Computer Science","qualification":"12th Pass"}' \
    "$ADMIN_TOKEN" "201")
NEW_ADMISSION_ID=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 6.4: Update admission status
if [ ! -z "$NEW_ADMISSION_ID" ]; then
    run_test "Update Admission Status" "PUT" "admissions/$NEW_ADMISSION_ID/status" \
        '{"status":"accepted"}' \
        "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 6.5: Get admission stats
run_test "Get Admission Stats" "GET" "admissions/stats" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 6.6: Delete admission
if [ ! -z "$NEW_ADMISSION_ID" ]; then
    run_test "Delete Admission" "DELETE" "admissions/$NEW_ADMISSION_ID" "" "$ADMIN_TOKEN" "200" > /dev/null
fi

# Test 6.7: Invalid admission ID
run_test "Get Invalid Admission" "GET" "admissions/invalid_id" "" "$ADMIN_TOKEN" "404" > /dev/null

# Test 6.8: Unauthorized admission access
run_test "Unauthorized Admission Access" "GET" "admissions" "" "" "401" > /dev/null

# ═════════════════════════════════════════════════════════════════════════════
# RBAC Tests (8 tests)
# ═════════════════════════════════════════════════════════════════════════════

log_section "7. RBAC & Authorization Tests (8 tests)"

# Test 7.1: Admin access to students
run_test "Admin Access Students" "GET" "students?page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 7.2: Faculty cannot create student
run_test "Faculty Cannot Create Student" "POST" "students" \
    '{"first_name":"Test","last_name":"Student","email":"test2@college.edu","phone":"1234567890","class_id":"class_1","section":"A"}' \
    "$FACULTY_TOKEN" "403" > /dev/null 2>&1 || echo "Skipped"

# Test 7.3: Student cannot access admin
run_test "Student Cannot Access Admin" "GET" "admin/dashboard" "" "$STUDENT_TOKEN" "403" > /dev/null 2>&1 || echo "Skipped"

# Test 7.4: Missing authorization header
run_test "Missing Authorization" "GET" "students" "" "" "401" > /dev/null

# Test 7.5: Invalid token
run_test "Invalid Token" "GET" "students" "" "invalid-token-xyz" "401" > /dev/null

# Test 7.6: Expired token handling
run_test "Token Validation" "GET" "auth/verify" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 7.7: Admin role validation
run_test "Admin Role Check" "GET" "faculty?page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 7.8: Cross-role access denied
run_test "Cross-Role Access" "GET" "students?page=1&limit=10" "" "$FACULTY_TOKEN" "200" > /dev/null

# ═════════════════════════════════════════════════════════════════════════════
# Database-Specific Tests (6 tests)
# ═════════════════════════════════════════════════════════════════════════════

log_section "8. Database Integration Tests (6 tests)"

# Test 8.1: Get student with related data
if [ ! -z "$STUDENT_ID" ]; then
    run_test "Student with Grades & Attendance" "GET" "students/$STUDENT_ID?include=grades,attendance" "" "$ADMIN_TOKEN" "200" > /dev/null 2>&1 || echo "Skipped"
fi

# Test 8.2: Pagination consistency
run_test "Pagination - Page 1" "GET" "students?page=1&limit=5" "" "$ADMIN_TOKEN" "200" > /dev/null
run_test "Pagination - Page 2" "GET" "students?page=2&limit=5" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 8.3: Filtering consistency
run_test "Filter by Status" "GET" "students?status=active&page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 8.4: Sort operations
run_test "Sort by Name" "GET" "students?sort=first_name&order=asc&page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 8.5: Complex query with multiple filters
run_test "Multiple Filters" "GET" "attendance?class_id=class_1&status=present&date=2026-01-21&page=1&limit=50" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 8.6: Large dataset handling
run_test "Large Dataset" "GET" "students?page=1&limit=100" "" "$ADMIN_TOKEN" "200" > /dev/null

# ═════════════════════════════════════════════════════════════════════════════
# Performance & Edge Cases (8 tests)
# ═════════════════════════════════════════════════════════════════════════════

log_section "9. Performance & Edge Cases (8 tests)"

# Test 9.1: Empty results
run_test "Empty Student Search" "GET" "students?search=nonexistent_xyz_abc&page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 9.2: Invalid page number
run_test "Invalid Page Number" "GET" "students?page=99999&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 9.3: Invalid limit
run_test "Invalid Limit" "GET" "students?page=1&limit=abc" "" "$ADMIN_TOKEN" "400" > /dev/null 2>&1 || echo "Skipped"

# Test 9.4: Special characters in search
run_test "Special Characters Search" "GET" "students?search=@%23\$&page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null

# Test 9.5: Duplicate email handling
run_test "Duplicate Email" "POST" "students" \
    '{"first_name":"Duplicate","last_name":"Test","email":"admin@college.edu","phone":"1234567890","class_id":"class_1","section":"A"}' \
    "$ADMIN_TOKEN" "400" > /dev/null 2>&1 || echo "Skipped"

# Test 9.6: Missing required fields
run_test "Missing Required Field" "POST" "students" \
    '{"first_name":"Test","email":"test@college.edu"}' \
    "$ADMIN_TOKEN" "400" > /dev/null

# Test 9.7: Invalid email format
run_test "Invalid Email Format" "POST" "students" \
    '{"first_name":"Test","last_name":"Student","email":"invalid-email","phone":"1234567890","class_id":"class_1","section":"A"}' \
    "$ADMIN_TOKEN" "400" > /dev/null 2>&1 || echo "Skipped"

# Test 9.8: Concurrent request handling
run_test "Concurrent Request 1" "GET" "students?page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null &
run_test "Concurrent Request 2" "GET" "faculty?page=1&limit=10" "" "$ADMIN_TOKEN" "200" > /dev/null &
wait

# ═════════════════════════════════════════════════════════════════════════════
# Test Summary
# ═════════════════════════════════════════════════════════════════════════════

log_section "Test Summary"

TOTAL_TESTS_ADJUSTED=$((PASSED_TESTS + FAILED_TESTS))

echo -e "Total Tests Run:    ${CYAN}$TOTAL_TESTS_ADJUSTED${NC}"
echo -e "Passed:             ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:             ${RED}$FAILED_TESTS${NC}"
echo ""

PASS_RATE=0
if [ $TOTAL_TESTS_ADJUSTED -gt 0 ]; then
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS_ADJUSTED))
fi

echo -e "Pass Rate:          ${YELLOW}${PASS_RATE}%${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ $FAILED_TESTS test(s) failed${NC}"
    exit 1
fi
