#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}PASS${NC}: $1"; }
fail() { echo -e "${RED}FAIL${NC}: $1"; exit 1; }

# Minimal valid rulebase
npx ts-node index.ts validate -r examples/rulebase-minimal.json && pass "rulebase-minimal.json" || fail "rulebase-minimal.json"

# Markdown rulebase (should be valid)
npx ts-node index.ts validate -r examples/rulebase-markdown.md --format-in md && pass "rulebase-markdown.md" || fail "rulebase-markdown.md"

# Minimal rulebase with custom schema (should be valid)
npx ts-node index.ts validate -r examples/rulebase-minimal.json --schema examples/rule-schema-custom.json && pass "rulebase-minimal.json + custom-schema" || fail "rulebase-minimal.json + custom-schema"

# Analyze with plugin (conflict check)
npx ts-node index.ts analyze -r examples/rulebase-complex.yaml --format-in yaml --plugin plugins/conflict-check.js --output json && pass "analyze with conflict-check plugin" || fail "analyze with conflict-check plugin"

# Add more tests as needed 