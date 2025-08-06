#!/bin/bash

# CareerCanvas Application Testing Script
# This script performs comprehensive testing of the development environment
# Update this script as new features are added during migration

set -e

# Load environment variables from .env file
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_PORT=5000
CLIENT_PORT=5173
HEALTH_CHECK_URL="http://localhost:${SERVER_PORT}/api/health"
CLIENT_URL="http://localhost:${CLIENT_PORT}/"
TEST_COOKIE_FILE="test-cookies.txt"

# Cleanup function
cleanup() {
    echo -e "\n${BLUE}🧹 Cleaning up test processes...${NC}"
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "tsx" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    rm -f "$TEST_COOKIE_FILE" test-dev.log 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Handle script interruption
trap cleanup EXIT INT TERM

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}🧪 CareerCanvas Application Tests${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo -e "${YELLOW}$(printf '%.0s-' {1..50})${NC}"
}

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

wait_for_server() {
    local url=$1
    local timeout=${2:-30}
    local count=0
    
    echo -e "${BLUE}⏳ Waiting for server to start...${NC}"
    while [ $count -lt $timeout ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Server is responding${NC}"
            return 0
        fi
        sleep 1
        count=$((count + 1))
        printf "."
    done
    
    echo -e "${RED}❌ Server failed to start within ${timeout} seconds${NC}"
    return 1
}

# Test TypeScript compilation
test_typescript() {
    print_section "TypeScript Compilation"
    
    if npx tsc --noEmit; then
        test_result 0 "TypeScript compilation successful"
        return 0
    else
        test_result 1 "TypeScript compilation failed"
        return 1
    fi
}

# Start development servers
start_dev_servers() {
    print_section "Development Server Startup"
    
    # Clean up any existing processes
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "tsx" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    echo -e "${BLUE}🚀 Starting development servers...${NC}"
    npm run dev > test-dev.log 2>&1 &
    
    # Wait for both servers to start
    if wait_for_server "$HEALTH_CHECK_URL" 15; then
        test_result 0 "Backend server started (port $SERVER_PORT)"
    else
        echo -e "${RED}❌ Backend server failed to start${NC}"
        echo -e "${YELLOW}📄 Server logs:${NC}"
        tail -20 test-dev.log || true
        return 1
    fi
    
    # Check client server
    sleep 2
    if curl -s -o /dev/null -w "%{http_code}" "$CLIENT_URL" | grep -q "200"; then
        test_result 0 "Frontend server started (port $CLIENT_PORT)"
    else
        test_result 1 "Frontend server failed to start"
        return 1
    fi
}

# Test basic endpoints
test_basic_endpoints() {
    print_section "Basic API Endpoints"
    
    # Health check
    local health_response
    health_response=$(curl -s "$HEALTH_CHECK_URL")
    if echo "$health_response" | jq -e '.status == "ok"' > /dev/null 2>&1; then
        test_result 0 "Health endpoint (/api/health)"
        echo -e "   ${BLUE}Response: ${health_response}${NC}"
    else
        test_result 1 "Health endpoint (/api/health)"
        return 1
    fi
    
    # Profile endpoint
    if curl -s "http://localhost:${SERVER_PORT}/api/profile" | jq -e '.name' > /dev/null 2>&1; then
        test_result 0 "Profile endpoint (/api/profile)"
    else
        test_result 1 "Profile endpoint (/api/profile)"
        return 1
    fi
    
    # Unauthenticated admin endpoint (should return 401)
    local admin_response_code
    admin_response_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${SERVER_PORT}/api/admin/me")
    if [ "$admin_response_code" = "401" ]; then
        test_result 0 "Admin authentication protection (/api/admin/me)"
    else
        test_result 1 "Admin authentication protection (/api/admin/me) - Expected 401, got $admin_response_code"
        return 1
    fi
}

# Test admin functionality
test_admin_functionality() {
    print_section "Admin Authentication & CRUD"
    
    # Initialize admin user
    echo -e "${BLUE}🔧 Ensuring admin user exists...${NC}"
    if node init-admin.js > /dev/null 2>&1; then
        test_result 0 "Admin user initialization"
    else
        test_result 1 "Admin user initialization"
        return 1
    fi
    
    # Get admin credentials from environment variables
    local username="${ADMIN_USERNAME:-filipe}"
    local password="${ADMIN_PASSWORD:-}"
    
    if [ -z "$password" ]; then
        test_result 1 "ADMIN_PASSWORD environment variable not set"
        echo -e "   ${YELLOW}💡 Please ensure ADMIN_PASSWORD is set in your .env file${NC}"
        return 1
    fi
    
    echo -e "${BLUE}👤 Using admin credentials: $username${NC}"
    
    # Test admin login
    local login_response
    login_response=$(curl -s -c "$TEST_COOKIE_FILE" -X POST -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}" \
        "http://localhost:${SERVER_PORT}/api/admin/login")
    
    if echo "$login_response" | jq -e '.username' > /dev/null 2>&1; then
        test_result 0 "Admin login (/api/admin/login)"
    else
        test_result 1 "Admin login (/api/admin/login)"
        echo -e "   ${RED}Response: $login_response${NC}"
        return 1
    fi
    
    # Test authenticated admin endpoint
    if curl -s -b "$TEST_COOKIE_FILE" "http://localhost:${SERVER_PORT}/api/admin/me" | jq -e '.username' > /dev/null 2>&1; then
        test_result 0 "Authenticated admin endpoint (/api/admin/me)"
    else
        test_result 1 "Authenticated admin endpoint (/api/admin/me)"
        return 1
    fi
    
    # Test experiences CRUD
    local experiences_count
    experiences_count=$(curl -s -b "$TEST_COOKIE_FILE" "http://localhost:${SERVER_PORT}/api/admin/experiences" | jq '. | length')
    if [ "$experiences_count" -gt 0 ] 2>/dev/null; then
        test_result 0 "Experiences read operation ($experiences_count experiences found)"
    else
        test_result 1 "Experiences read operation"
        return 1
    fi
    
    # Test create experience
    local create_response
    create_response=$(curl -s -b "$TEST_COOKIE_FILE" -X POST -H "Content-Type: application/json" \
        -d '{"jobTitle":"Test Position","company":"Test Company","industry":"Technology","startDate":"2024-01","endDate":"2024-12","isCurrentJob":false,"description":"Test description","accomplishments":"Test accomplishments","tools":[]}' \
        "http://localhost:${SERVER_PORT}/api/admin/experiences")
    
    local test_experience_id
    test_experience_id=$(echo "$create_response" | jq -r '.id')
    
    if [ "$test_experience_id" != "null" ] && [ -n "$test_experience_id" ]; then
        test_result 0 "Experience create operation (ID: $test_experience_id)"
        
        # Test delete experience (cleanup)
        local delete_response
        delete_response=$(curl -s -b "$TEST_COOKIE_FILE" -X DELETE \
            "http://localhost:${SERVER_PORT}/api/admin/experiences/$test_experience_id")
        
        if echo "$delete_response" | jq -e '.message' > /dev/null 2>&1; then
            test_result 0 "Experience delete operation"
        else
            test_result 1 "Experience delete operation"
        fi
    else
        test_result 1 "Experience create operation"
        echo -e "   ${RED}Response: $create_response${NC}"
        return 1
    fi
}

# Test database connectivity
test_database() {
    print_section "Database Connectivity"
    
    # Test database connection through the health endpoint
    local health_response
    health_response=$(curl -s "$HEALTH_CHECK_URL")
    
    if echo "$health_response" | jq -e '.status == "ok"' > /dev/null 2>&1; then
        test_result 0 "Database connectivity (via health check)"
        
        # Additional database test via profile endpoint
        if curl -s "http://localhost:${SERVER_PORT}/api/profile" | jq -e '.name' > /dev/null 2>&1; then
            test_result 0 "Database query operations (via profile endpoint)"
        else
            test_result 1 "Database query operations (via profile endpoint)"
            return 1
        fi
    else
        test_result 1 "Database connectivity"
        return 1
    fi
}

# Generate test report
generate_report() {
    print_section "Test Summary"
    
    echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
    echo -e "${BLUE}📊 Test Coverage:${NC}"
    echo -e "   • TypeScript compilation"
    echo -e "   • Development server startup (frontend & backend)"
    echo -e "   • Database connectivity"
    echo -e "   • Basic API endpoints"
    echo -e "   • Authentication system"
    echo -e "   • Admin CRUD operations"
    echo -e "   • Session management"
    
    echo -e "\n${BLUE}🌐 Application URLs:${NC}"
    echo -e "   • Frontend: http://localhost:${CLIENT_PORT}"
    echo -e "   • Backend API: http://localhost:${SERVER_PORT}"
    echo -e "   • Health Check: ${HEALTH_CHECK_URL}"
    
    echo -e "\n${YELLOW}💡 Next Steps:${NC}"
    echo -e "   1. Visit http://localhost:${CLIENT_PORT} to test the frontend"
    echo -e "   2. Visit http://localhost:${CLIENT_PORT}/admin/login to test admin interface"
    echo -e "   3. Use the admin credentials shown during testing"
    echo -e "   4. Run 'npm run dev' manually to continue development"
    
    echo -e "\n${GREEN}✅ Application is ready for development!${NC}"
}

# Main execution
main() {
    print_header
    
    echo -e "${BLUE}🔍 Starting comprehensive application tests...${NC}"
    echo -e "${YELLOW}⚠️  This will start and stop development servers${NC}\n"
    
    # Run all tests
    test_typescript
    start_dev_servers
    test_database
    test_basic_endpoints
    test_admin_functionality
    
    generate_report
    
    echo -e "\n${GREEN}🎯 All tests passed! Application is working correctly.${NC}"
    return 0
}

# Check if required tools are available
check_dependencies() {
    local missing_deps=()
    
    command -v node >/dev/null 2>&1 || missing_deps+=("node")
    command -v npm >/dev/null 2>&1 || missing_deps+=("npm")
    command -v curl >/dev/null 2>&1 || missing_deps+=("curl")
    command -v jq >/dev/null 2>&1 || missing_deps+=("jq")
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required dependencies: ${missing_deps[*]}${NC}"
        echo -e "${YELLOW}💡 Please install missing dependencies and try again${NC}"
        
        if [[ ! " ${missing_deps[*]} " =~ " jq " ]]; then
            echo -e "${BLUE}To install jq on Ubuntu/Debian: sudo apt-get install jq${NC}"
            echo -e "${BLUE}To install jq on macOS: brew install jq${NC}"
        fi
        
        exit 1
    fi
}

# Run dependency check and main function
check_dependencies
main "$@"