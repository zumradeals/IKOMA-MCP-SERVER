#!/bin/bash

set -e

echo "🧪 IKOMA MCP v2.0 Smoke Test"
echo "============================="
echo "Expected: 19 tools exactly"
echo ""

# Load API key
if [ -f /opt/ikoma/api-key.txt ]; then
  API_KEY=$(cat /opt/ikoma/api-key.txt)
else
  echo "❌ API key not found. Have you run install.sh?"
  exit 1
fi

BASE_URL="http://localhost:3000"
HEADERS="-H 'X-Api-Key: $API_KEY' -H 'X-Role: builder' -H 'Content-Type: application/json'"

echo "Testing HTTP API endpoint..."

# Test 1: Health check
echo -n "1. Health check... "
RESPONSE=$(curl -s $BASE_URL/health)
if echo "$RESPONSE" | grep -q "healthy"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 2: Platform info
echo -n "2. Platform info (verify 19 tools)... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: observer" \
  -X POST $BASE_URL/execute/platform.info -d '{}')
if echo "$RESPONSE" | grep -q "version"; then
  TOOL_COUNT=$(echo "$RESPONSE" | jq '.result.capabilities | length')
  if [ "$TOOL_COUNT" = "19" ]; then
    echo "✅ PASS (19 tools confirmed)"
  else
    echo "❌ FAIL: Expected 19 tools, got $TOOL_COUNT"
    exit 1
  fi
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 3: Platform check
echo -n "3. Platform check... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: observer" \
  -X POST $BASE_URL/execute/platform.check -d '{}')
if echo "$RESPONSE" | grep -q "healthy"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 4: List apps (should be empty)
echo -n "4. List applications... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: observer" \
  -X POST $BASE_URL/execute/apps.list -d '{}')
if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 5: Initialize test app
echo -n "5. Initialize test app... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: builder" \
  -X POST $BASE_URL/execute/apps.init -d '{"appName":"testapp"}')
if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 6: Check app status
echo -n "6. Check app status... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: observer" \
  -X POST $BASE_URL/execute/apps.status -d '{"appName":"testapp"}')
if echo "$RESPONSE" | grep -q "testapp"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 7: Validate app
echo -n "7. Validate app... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: observer" \
  -X POST $BASE_URL/execute/apps.validate -d '{"appName":"testapp"}')
if echo "$RESPONSE" | grep -q "valid"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 8: Create database
echo -n "8. Create database... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: builder" \
  -X POST $BASE_URL/execute/db.create -d '{"appName":"testapp"}')
if echo "$RESPONSE" | grep -q "success\|exists"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 9: Database status
echo -n "9. Database status... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: observer" \
  -X POST $BASE_URL/execute/db.status -d '{"appName":"testapp"}')
if echo "$RESPONSE" | grep -q "exists"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 10: Verify release
echo -n "10. Verify release... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: observer" \
  -X POST $BASE_URL/execute/artifact.verify_release -d '{"appName":"testapp"}')
if echo "$RESPONSE" | grep -q "verified"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 11: Generate runbook
echo -n "11. Generate runbook... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: observer" \
  -X POST $BASE_URL/execute/artifact.generate_runbook -d '{"appName":"testapp"}')
if echo "$RESPONSE" | grep -q "appName"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

# Test 12: Clean up - remove test app
echo -n "12. Remove test app... "
RESPONSE=$(curl -s -H "X-Api-Key: $API_KEY" -H "X-Role: admin" \
  -X POST $BASE_URL/execute/apps.remove -d '{"appName":"testapp"}')
if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $RESPONSE"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All smoke tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "IKOMA MCP v2.0 is ready for use."
echo ""