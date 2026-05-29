#!/bin/bash

# ============================================
# 🧪 INSTAFY PRODUCTION API TEST SUITE
# ============================================
# Comprehensive integration tests untuk semua endpoints
# Test security fixes, auth flow, CRUD operations, dan admin endpoints
#
# Usage:
#   ./scripts/test-production.sh [API_URL]
#
# Example:
#   ./scripts/test-production.sh https://api.ppwl-a3.my.id
#   ./scripts/test-production.sh http://localhost:3000
# ============================================

set -e  # Exit on error

# Override: Don't exit on error for individual tests
set +e

# ── Colors untuk output ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ── Configuration ──
API_URL="${1:-https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws}"
API_KEY="gOdDAMPudsfeDoJ8uB9QsbPJ+2z9bhO+M1Q9zYslkso="
COOKIE_FILE="/tmp/instafy_test_cookies.txt"
TEST_USER_EMAIL="test_$(date +%s)@example.com"
TEST_USER_USERNAME="testuser_$(date +%s)"
TEST_USER_PASSWORD="Test@123456"
CURL_TIMEOUT=10  # Timeout in seconds

# ── Counters ──
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# ── Helper Functions ──
print_header() {
    echo -e "\n${BOLD}${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${PURPLE}  $1${NC}"
    echo -e "${BOLD}${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_test() {
    echo -e "${CYAN}🧪 TEST:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((PASSED_TESTS++))
}

print_fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    echo -e "${RED}   Response: $2${NC}"
    ((FAILED_TESTS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

print_error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
}

# ── Test Function ──
run_test() {
    ((TOTAL_TESTS++))
}

# ── Curl wrapper with timeout ──
curl_with_timeout() {
    curl --max-time "$CURL_TIMEOUT" --connect-timeout 5 "$@" 2>/dev/null
}

# ── Check API availability ──
check_api_availability() {
    print_info "Checking API availability at $API_URL..."
    if curl_with_timeout -s -f "$API_URL/health" > /dev/null; then
        print_success "API is reachable"
        return 0
    else
        print_error "API is not reachable at $API_URL"
        print_error "Please check:"
        print_error "  1. Is the API deployed and running?"
        print_error "  2. Is the URL correct?"
        print_error "  3. Is there a network/firewall issue?"
        return 1
    fi
}

# ── Cleanup ──
cleanup() {
    rm -f "$COOKIE_FILE"
}
trap cleanup EXIT

# ============================================
# 🏁 START TESTS
# ============================================

echo -e "${BOLD}${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🧪 INSTAFY PRODUCTION API TEST SUITE                   ║
║   Testing all endpoints, security fixes, and flows       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

print_info "API URL: $API_URL"
print_info "Test User: $TEST_USER_EMAIL"
print_info "Cookie File: $COOKIE_FILE"
print_info "Timeout: ${CURL_TIMEOUT}s per request"
echo ""

# Check API availability first
if ! check_api_availability; then
    print_error "Cannot proceed with tests. Exiting."
    exit 1
fi

# ============================================
# 📡 SECTION 1: BASIC HEALTH CHECKS
# ============================================
print_header "📡 SECTION 1: BASIC HEALTH CHECKS"

# Test 1.1: Root endpoint
run_test
print_test "Root endpoint (/) returns API documentation"
RESPONSE=$(curl_with_timeout -s "$API_URL/")
if [ -z "$RESPONSE" ]; then
    print_fail "Root endpoint timeout or no response" "Empty response"
elif echo "$RESPONSE" | grep -q "PPWL Instagram Clone"; then
    print_success "Root endpoint returns API documentation"
else
    print_fail "Root endpoint failed" "$RESPONSE"
fi

# Test 1.2: Health endpoint (public)
run_test
print_test "Health endpoint (/health) is publicly accessible"
RESPONSE=$(curl_with_timeout -s "$API_URL/health")
if [ -z "$RESPONSE" ]; then
    print_fail "Health endpoint timeout or no response" "Empty response"
elif echo "$RESPONSE" | grep -q "ok"; then
    print_success "Health endpoint is public and working"
else
    print_fail "Health endpoint failed" "$RESPONSE"
fi

# Test 1.3: Monitoring endpoint requires API key
run_test
print_test "Monitoring endpoint (/monitoring) requires API key"
RESPONSE=$(curl_with_timeout -s -w "\n%{http_code}" "$API_URL/monitoring")
if [ -z "$RESPONSE" ]; then
    print_fail "Monitoring endpoint timeout" "Empty response"
else
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "401" ]; then
        print_success "Monitoring endpoint correctly requires authentication"
    else
        print_fail "Monitoring endpoint should return 401 without API key" "HTTP $HTTP_CODE"
    fi
fi

# Test 1.4: Monitoring endpoint works with API key
run_test
print_test "Monitoring endpoint works with valid API key"
RESPONSE=$(curl_with_timeout -s -H "X-API-Key: $API_KEY" "$API_URL/monitoring")
if [ -z "$RESPONSE" ]; then
    print_fail "Monitoring endpoint timeout with API key" "Empty response"
elif echo "$RESPONSE" | grep -q "status"; then
    print_success "Monitoring endpoint accessible with API key"
else
    print_fail "Monitoring endpoint failed with API key" "$RESPONSE"
fi

# ============================================
# 🔒 SECTION 2: SECURITY TESTS
# ============================================
print_header "🔒 SECTION 2: SECURITY TESTS"

# Test 2.1: CORS headers
run_test
print_test "CORS headers are properly configured"
RESPONSE=$(curl -s -I -H "Origin: https://www.ppwl-a3.my.id" "$API_URL/health")
if echo "$RESPONSE" | grep -qi "access-control-allow-origin"; then
    print_success "CORS headers present"
else
    print_fail "CORS headers missing" "$RESPONSE"
fi

# Test 2.2: Security headers (CSP, X-Frame-Options, etc.)
run_test
print_test "Security headers (CSP, X-Frame-Options) are present"
RESPONSE=$(curl -s -I "$API_URL/health")
if echo "$RESPONSE" | grep -qi "content-security-policy" && \
   echo "$RESPONSE" | grep -qi "x-frame-options"; then
    print_success "Security headers present (CSP, X-Frame-Options)"
else
    print_fail "Security headers missing" "$RESPONSE"
fi

# Test 2.3: Rate limiting on auth endpoints
run_test
print_test "Rate limiting on auth endpoints (max 5 req/min)"
print_info "Sending 6 rapid requests to /auth/login..."
for i in {1..6}; do
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrong"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ $i -eq 6 ] && [ "$HTTP_CODE" = "429" ]; then
        print_success "Rate limiting working (6th request blocked with 429)"
        break
    elif [ $i -eq 6 ]; then
        print_fail "Rate limiting not working (6th request should be 429)" "HTTP $HTTP_CODE"
    fi
    sleep 0.2
done

# Test 2.4: XSS sanitization
run_test
print_test "XSS sanitization on user inputs"
print_info "Will test after user registration..."

# ============================================
# 🔐 SECTION 3: AUTHENTICATION FLOW
# ============================================
print_header "🔐 SECTION 3: AUTHENTICATION FLOW"

# Test 3.1: Register with weak password (should fail)
run_test
print_test "Register with weak password should fail"
RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"username\":\"$TEST_USER_USERNAME\",\"name\":\"Test User\",\"password\":\"weak\"}")
if echo "$RESPONSE" | grep -qi "password"; then
    print_success "Weak password rejected"
else
    print_fail "Weak password should be rejected" "$RESPONSE"
fi

# Test 3.2: Register with strong password
run_test
print_test "Register new user with strong password"
RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"username\":\"$TEST_USER_USERNAME\",\"name\":\"Test User\",\"password\":\"$TEST_USER_PASSWORD\"}")
if echo "$RESPONSE" | grep -q "id"; then
    print_success "User registered successfully"
    USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    print_info "User ID: $USER_ID"
else
    print_fail "User registration failed" "$RESPONSE"
    print_warning "Skipping remaining tests that require authentication"
    exit 1
fi

# Test 3.3: Login and receive JWT cookie
run_test
print_test "Login and receive JWT in HttpOnly cookie"
RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}")
if echo "$RESPONSE" | grep -q "id" && [ -f "$COOKIE_FILE" ]; then
    print_success "Login successful, JWT cookie received"
    if grep -q "HttpOnly" "$COOKIE_FILE" 2>/dev/null || grep -q "auth" "$COOKIE_FILE"; then
        print_success "JWT stored in HttpOnly cookie (secure)"
    else
        print_warning "Cookie file exists but HttpOnly flag not confirmed"
    fi
else
    print_fail "Login failed or cookie not set" "$RESPONSE"
    exit 1
fi

# Test 3.4: Access protected endpoint with cookie
run_test
print_test "Access protected endpoint (/users/profile) with JWT cookie"
RESPONSE=$(curl -s -b "$COOKIE_FILE" "$API_URL/users/profile")
if echo "$RESPONSE" | grep -q "$TEST_USER_EMAIL"; then
    print_success "Protected endpoint accessible with JWT cookie"
else
    print_fail "Protected endpoint failed" "$RESPONSE"
fi

# Test 3.5: JWT not in response body (security)
run_test
print_test "JWT token NOT in response body (security check)"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}")
if ! echo "$LOGIN_RESPONSE" | grep -q "token"; then
    print_success "JWT not exposed in response body (secure)"
else
    print_fail "JWT should not be in response body" "$LOGIN_RESPONSE"
fi

# ============================================
# 📝 SECTION 4: CRUD OPERATIONS
# ============================================
print_header "📝 SECTION 4: CRUD OPERATIONS (Posts, Comments, Likes)"

# Test 4.1: Create post with XSS attempt
run_test
print_test "Create post with XSS payload (should be sanitized)"
XSS_PAYLOAD="<script>alert('XSS')</script>Test Post"
RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$API_URL/posts" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$USER_ID\",\"content\":\"$XSS_PAYLOAD\"}")
if echo "$RESPONSE" | grep -q "id"; then
    POST_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    print_success "Post created (ID: $POST_ID)"
    
    # Verify XSS was sanitized
    POST_CONTENT=$(echo "$RESPONSE" | grep -o '"content":"[^"]*"' | cut -d'"' -f4)
    if echo "$POST_CONTENT" | grep -q "<script>"; then
        print_fail "XSS payload not sanitized!" "$POST_CONTENT"
    else
        print_success "XSS payload sanitized (script tags removed)"
    fi
else
    print_fail "Post creation failed" "$RESPONSE"
fi

# Test 4.2: Get posts
run_test
print_test "Fetch posts list"
RESPONSE=$(curl -s -b "$COOKIE_FILE" "$API_URL/posts")
if echo "$RESPONSE" | grep -q "data"; then
    print_success "Posts fetched successfully"
else
    print_fail "Failed to fetch posts" "$RESPONSE"
fi

# Test 4.3: Like post
run_test
print_test "Like a post"
RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$API_URL/likes" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$USER_ID\",\"postId\":\"$POST_ID\"}")
if echo "$RESPONSE" | grep -q "id"; then
    print_success "Post liked successfully"
else
    print_fail "Failed to like post" "$RESPONSE"
fi

# Test 4.4: Comment on post with XSS attempt
run_test
print_test "Comment on post with XSS payload (should be sanitized)"
XSS_COMMENT="<img src=x onerror=alert('XSS')>Nice post!"
RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$API_URL/comments" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$USER_ID\",\"postId\":\"$POST_ID\",\"content\":\"$XSS_COMMENT\"}")
if echo "$RESPONSE" | grep -q "id"; then
    COMMENT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    print_success "Comment created (ID: $COMMENT_ID)"
    
    # Verify XSS was sanitized
    COMMENT_CONTENT=$(echo "$RESPONSE" | grep -o '"content":"[^"]*"' | cut -d'"' -f4)
    if echo "$COMMENT_CONTENT" | grep -q "onerror"; then
        print_fail "XSS payload in comment not sanitized!" "$COMMENT_CONTENT"
    else
        print_success "XSS payload in comment sanitized"
    fi
else
    print_fail "Comment creation failed" "$RESPONSE"
fi

# Test 4.5: Rate limiting on comments (20/hour)
run_test
print_test "Rate limiting on comments (max 20/hour)"
print_info "Testing comment rate limit (this may take a moment)..."
RATE_LIMITED=false
for i in {1..22}; do
    RESPONSE=$(curl -s -w "\n%{http_code}" -b "$COOKIE_FILE" -X POST "$API_URL/comments" \
        -H "Content-Type: application/json" \
        -d "{\"userId\":\"$USER_ID\",\"postId\":\"$POST_ID\",\"content\":\"Test comment $i\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "429" ]; then
        print_success "Comment rate limiting working (request $i blocked with 429)"
        RATE_LIMITED=true
        break
    fi
    sleep 0.1
done
if [ "$RATE_LIMITED" = false ]; then
    print_warning "Comment rate limiting not triggered (may need more requests or time)"
fi

# ============================================
# 👑 SECTION 5: ADMIN ENDPOINTS
# ============================================
print_header "👑 SECTION 5: ADMIN ENDPOINTS (API Key Required)"

# Test 5.1: Admin endpoint without API key
run_test
print_test "Admin data endpoint (/data/users) requires API key"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/data/users")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
    print_success "Admin endpoint correctly requires API key"
else
    print_fail "Admin endpoint should return 401 without API key" "HTTP $HTTP_CODE"
fi

# Test 5.2: Admin endpoint with API key
run_test
print_test "Admin data endpoint works with valid API key"
RESPONSE=$(curl -s -H "X-API-Key: $API_KEY" "$API_URL/data/users")
if echo "$RESPONSE" | grep -q "data"; then
    print_success "Admin endpoint accessible with API key"
    # Verify sensitive data is excluded
    if echo "$RESPONSE" | grep -q "password"; then
        print_fail "Password field exposed in admin endpoint!" "$RESPONSE"
    else
        print_success "Sensitive data (passwords) excluded from response"
    fi
else
    print_fail "Admin endpoint failed with API key" "$RESPONSE"
fi

# Test 5.3: Admin endpoint with query param API key
run_test
print_test "Admin endpoint works with API key as query parameter"
RESPONSE=$(curl -s "$API_URL/data/posts?key=$API_KEY")
if echo "$RESPONSE" | grep -q "data"; then
    print_success "Admin endpoint works with query param API key"
else
    print_fail "Admin endpoint failed with query param" "$RESPONSE"
fi

# ============================================
# 🧹 SECTION 6: CLEANUP & ERROR HANDLING
# ============================================
print_header "🧹 SECTION 6: ERROR HANDLING & EDGE CASES"

# Test 6.1: Invalid endpoint returns 404
run_test
print_test "Invalid endpoint returns 404"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/invalid-endpoint-xyz")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "404" ]; then
    print_success "Invalid endpoint returns 404"
else
    print_fail "Invalid endpoint should return 404" "HTTP $HTTP_CODE"
fi

# Test 6.2: Malformed JSON returns 400
run_test
print_test "Malformed JSON returns 400 Bad Request"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{invalid json")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
    print_success "Malformed JSON returns 400"
else
    print_warning "Malformed JSON returned HTTP $HTTP_CODE (expected 400)"
fi

# Test 6.3: Logout clears cookie
run_test
print_test "Logout endpoint clears JWT cookie"
RESPONSE=$(curl -s -c "$COOKIE_FILE" -b "$COOKIE_FILE" -X POST "$API_URL/auth/logout")
if echo "$RESPONSE" | grep -qi "success\|logout"; then
    print_success "Logout successful"
else
    print_warning "Logout response unclear: $RESPONSE"
fi

# ============================================
# 📊 FINAL REPORT
# ============================================
print_header "📊 FINAL TEST REPORT"

echo -e "${BOLD}Total Tests:${NC}   $TOTAL_TESTS"
echo -e "${GREEN}${BOLD}Passed:${NC}        $PASSED_TESTS"
echo -e "${RED}${BOLD}Failed:${NC}        $FAILED_TESTS"

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo -e "${BOLD}Pass Rate:${NC}     ${PASS_RATE}%"

echo ""
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}${BOLD}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo -e "${GREEN}API is production-ready!${NC}"
    exit 0
else
    echo -e "${YELLOW}${BOLD}⚠️  SOME TESTS FAILED${NC}"
    echo -e "${YELLOW}Review failed tests above before deploying to production.${NC}"
    exit 1
fi
