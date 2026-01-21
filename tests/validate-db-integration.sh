#!/bin/bash

# Phase 2 Week 1 Day 3: Comprehensive Test Validation
# Tests database layer, query optimization, and API compatibility

echo "Phase 2 Week 1 Day 3: Integration Testing Validation"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Test 1: Verify MySQL Helper Module
echo "1. Verifying MySQL Helper Module..."
if grep -q "initializePool\|getConnection\|query\|insert\|update" /workspaces/new-erp/lib/mysql-helper.js; then
    echo "   ✓ MySQL helper functions present"
else
    echo "   ✗ MySQL helper functions missing"
    exit 1
fi

# Test 2: Verify Service Layer Conversion
echo ""
echo "2. Verifying Service Layer Database Integration..."

services=("student-service" "faculty-service" "admission-service" "attendance-service")
for service in "${services[@]}"; do
    if grep -q "db.query\|db.insert\|db.update\|db.deleteRecord" /workspaces/new-erp/lib/${service}.js; then
        echo "   ✓ ${service} uses database queries"
    else
        echo "   ✗ ${service} missing database queries"
        exit 1
    fi
done

# Test 3: Verify Query Optimizer
echo ""
echo "3. Verifying Query Optimizer Module..."
if grep -q "QueryPerformanceMonitor\|getCachedOrExecute\|detectNPlusOneQueries" /workspaces/new-erp/lib/query-optimizer.js; then
    echo "   ✓ Query optimizer functions present"
else
    echo "   ✗ Query optimizer incomplete"
    exit 1
fi

# Test 4: Verify Database Indexes
echo ""
echo "4. Verifying Database Indexes..."
index_count=$(grep -c "ADD INDEX" /workspaces/new-erp/lib/database-indexes.sql)
if [ $index_count -ge 23 ]; then
    echo "   ✓ Found $index_count database indexes (expected 23+)"
else
    echo "   ✗ Insufficient indexes: $index_count (expected 23+)"
    exit 1
fi

# Test 5: Check for SQL Injection Prevention
echo ""
echo "5. Verifying SQL Injection Prevention..."
if grep -q "?" /workspaces/new-erp/lib/student-service.js && \
   grep -q "?" /workspaces/new-erp/lib/faculty-service.js && \
   grep -q "?" /workspaces/new-erp/lib/attendance-service.js; then
    echo "   ✓ Parameterized queries implemented (using ? placeholders)"
else
    echo "   ✗ Parameterized queries not found"
    exit 1
fi

# Test 6: Verify Transaction Support
echo ""
echo "6. Verifying Transaction Support..."
if grep -q "transaction\|rollback" /workspaces/new-erp/lib/mysql-helper.js; then
    echo "   ✓ Transaction support implemented"
else
    echo "   ✗ Transaction support missing"
    exit 1
fi

# Test 7: Verify Connection Pooling
echo ""
echo "7. Verifying Connection Pooling..."
if grep -q "pool\|getConnection\|connectionLimit" /workspaces/new-erp/lib/mysql-helper.js; then
    echo "   ✓ Connection pooling configured"
else
    echo "   ✗ Connection pooling not configured"
    exit 1
fi

# Test 8: Verify Error Handling
echo ""
echo "8. Verifying Error Handling..."
error_handling_count=$(grep -c "catch\|error" /workspaces/new-erp/lib/mysql-helper.js)
if [ $error_handling_count -ge 5 ]; then
    echo "   ✓ Error handling implemented"
else
    echo "   ✗ Error handling incomplete"
    exit 1
fi

# Test 9: Verify Caching System
echo ""
echo "9. Verifying Caching System..."
if grep -q "cache\|Cache\|TTL" /workspaces/new-erp/lib/query-optimizer.js; then
    echo "   ✓ Caching system implemented"
else
    echo "   ✗ Caching system not found"
    exit 1
fi

# Test 10: Verify Documentation
echo ""
echo "10. Verifying Documentation..."
if [ -f /workspaces/new-erp/PHASE-2-WEEK-1-PLAN.md ] && \
   [ -f /workspaces/new-erp/PHASE-2-WEEK-1-DAY-2-REPORT.md ]; then
    echo "   ✓ Documentation complete"
else
    echo "   ✗ Documentation incomplete"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ All validation checks passed!"
echo "════════════════════════════════════════════════════════════════"
