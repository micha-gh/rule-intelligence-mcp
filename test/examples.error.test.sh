#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}PASS${NC}: $1"; }
fail() { echo -e "${RED}FAIL${NC}: $1"; exit 1; }

# Invalid rulebase (should fail)
if npx ts-node index.ts validate -r examples/rulebase-invalid.json; then
  fail "rulebase-invalid.json (should have failed)"
else
  pass "rulebase-invalid.json (correctly failed)"
fi

# Complex YAML rulebase (should fail)
if npx ts-node index.ts validate -r examples/rulebase-complex.yaml --format-in yaml; then
  fail "rulebase-complex.yaml (should have failed)"
else
  pass "rulebase-complex.yaml (correctly failed)"
fi 