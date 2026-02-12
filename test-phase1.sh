#!/bin/bash

echo "🧪 Testing Phase 1 Implementation"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "1️⃣  Checking file existence..."
echo "================================"

# Check SQL migration
if [ -f "supabase/migrations/005_investment_system_schema.sql" ]; then
    echo -e "${GREEN}✅${NC} Database migration file exists"
else
    echo -e "${RED}❌${NC} Database migration file NOT FOUND"
fi

# Check scripts
scripts=(
    "scripts/fetch-valuation.ts"
    "scripts/build-industry-benchmarks.ts"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        echo -e "${GREEN}✅${NC} Script exists: $script"
    else
        echo -e "${RED}❌${NC} Script NOT FOUND: $script"
    fi
done

# Check lib files
lib_files=(
    "src/lib/prompts/investment-analysis.ts"
    "src/lib/analysis/investment-analyzer.ts"
    "src/lib/analysis/save-analysis.ts"
    "src/lib/sec-edgar/fetch-document.ts"
)

for file in "${lib_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} Lib file exists: $file"
    else
        echo -e "${RED}❌${NC} Lib file NOT FOUND: $file"
    fi
done

# Check API route
if [ -f "src/app/api/analysis/[symbol]/route.ts" ]; then
    echo -e "${GREEN}✅${NC} API route exists"
else
    echo -e "${RED}❌${NC} API route NOT FOUND"
fi

echo ""
echo "2️⃣  Checking SQL syntax..."
echo "================================"

# Basic SQL validation
if grep -q "CREATE TABLE IF NOT EXISTS company_valuation" "supabase/migrations/005_investment_system_schema.sql"; then
    echo -e "${GREEN}✅${NC} company_valuation table defined"
fi

if grep -q "CREATE TABLE IF NOT EXISTS industry_benchmarks" "supabase/migrations/005_investment_system_schema.sql"; then
    echo -e "${GREEN}✅${NC} industry_benchmarks table defined"
fi

if grep -q "CREATE TABLE IF NOT EXISTS research_reports" "supabase/migrations/005_investment_system_schema.sql"; then
    echo -e "${GREEN}✅${NC} research_reports table defined"
fi

echo ""
echo "3️⃣  Checking TypeScript syntax..."
echo "================================"

# Check for TypeScript errors
cd earnlytics-web

# Check if tsx is available
if npx tsc --noEmit 2>&1 | grep -q "error"; then
    echo -e "${YELLOW}⚠️${NC}  TypeScript errors found (run 'npm run build' for details)"
else
    echo -e "${GREEN}✅${NC} No TypeScript syntax errors"
fi

echo ""
echo "4️⃣  Checking package.json scripts..."
echo "================================"

if grep -q "sync:valuation" "package.json"; then
    echo -e "${GREEN}✅${NC} sync:valuation script defined"
else
    echo -e "${RED}❌${NC} sync:valuation script NOT FOUND"
fi

if grep -q "sync:benchmarks" "package.json"; then
    echo -e "${GREEN}✅${NC} sync:benchmarks script defined"
else
    echo -e "${RED}❌${NC} sync:benchmarks script NOT FOUND"
fi

echo ""
echo "5️⃣  Checking GitHub Actions..."
echo "================================"

if [ -f "../.github/workflows/sync-investment-data.yml" ]; then
    echo -e "${GREEN}✅${NC} GitHub Actions workflow exists"
else
    echo -e "${RED}❌${NC} GitHub Actions workflow NOT FOUND"
fi

echo ""
echo "================================"
echo "✨ Phase 1 test complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run sync:valuation' to test valuation sync"
echo "  2. Run 'npm run sync:benchmarks' to test benchmark sync"
echo "  3. Test API: curl http://localhost:3000/api/analysis/AAPL/investment"
echo ""
