#!/bin/bash

# College ERP - Phase 1 Week 1 Setup Script
# This script handles Docker-based setup since host PHP has OpenSSL issues

set -e

echo "========================================"
echo "College ERP - Phase 1 Week 1 Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Docker status
echo -e "${BLUE}1. Checking Docker containers...${NC}"
docker-compose ps
echo ""

# Wait for containers to be healthy
echo -e "${BLUE}2. Waiting for containers to be healthy...${NC}"
sleep 5
docker-compose ps | grep -E "healthy|Up"
echo ""

# Test database connection
echo -e "${BLUE}3. Testing database connection...${NC}"
if docker-compose exec -T mysql mysql -u root -proot -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection OK${NC}"
else
    echo -e "${RED}✗ Database connection FAILED${NC}"
    exit 1
fi
echo ""

# Test Redis connection
echo -e "${BLUE}4. Testing Redis connection...${NC}"
if docker-compose exec -T redis redis-cli PING | grep -q "PONG"; then
    echo -e "${GREEN}✓ Redis connection OK${NC}"
else
    echo -e "${RED}✗ Redis connection FAILED${NC}"
    exit 1
fi
echo ""

# Verify .env file exists
echo -e "${BLUE}5. Checking .env file...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    echo "  DB_HOST: $(grep DB_HOST .env | cut -d= -f2)"
    echo "  DB_DATABASE: $(grep DB_DATABASE .env | cut -d= -f2)"
else
    echo -e "${RED}✗ .env file NOT found${NC}"
    echo "  Creating from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env created${NC}"
fi
echo ""

# Show connection details
echo -e "${BLUE}6. Connection Details:${NC}"
echo "  MySQL:"
echo "    - Host: mysql (Docker)"
echo "    - Port: 3306"
echo "    - Database: gegok12"
echo "    - User: root"
echo "    - Password: root"
echo "  Redis:"
echo "    - Host: redis (Docker)"
echo "    - Port: 6379"
echo "    - Status: CONNECTED"
echo ""

# Show next steps
echo -e "${BLUE}7. Next Steps:${NC}"
echo ""
echo -e "${YELLOW}A. Install Composer Dependencies:${NC}"
echo "   Option 1 (Recommended): Use Docker composer image"
echo "   docker run --rm -v \$(pwd):/app composer install"
echo ""
echo "   Option 2: If PHP is available on host:"
echo "   composer install"
echo ""

echo -e "${YELLOW}B. Generate Laravel App Key:${NC}"
echo "   php artisan key:generate"
echo ""

echo -e "${YELLOW}C. Run Database Migrations:${NC}"
echo "   php artisan migrate"
echo ""

echo -e "${YELLOW}D. Seed Database (Optional):${NC}"
echo "   php artisan db:seed"
echo ""

echo -e "${YELLOW}E. Verify Setup:${NC}"
echo "   curl http://localhost:8000/api/health"
echo ""

echo "========================================"
echo "Docker Containers Status:"
echo "========================================"
docker-compose ps
echo ""
echo -e "${GREEN}✓ Setup verification complete!${NC}"
echo ""
