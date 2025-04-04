#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 is not installed${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 is installed${NC}"
        return 0
    fi
}

# Function to check if a file exists
check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}✗ $1 is missing${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 exists${NC}"
        return 0
    fi
}

# Function to check if a directory exists
check_dir() {
    if [ ! -d "$1" ]; then
        echo -e "${RED}✗ $1 is missing${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 exists${NC}"
        return 0
    fi
}

echo "Verifying NutriVision test setup..."
echo "----------------------------------------"

# Check required commands
echo -e "\n${YELLOW}Checking required commands:${NC}"
check_command "node"
check_command "npm"
check_command "ts-node"
check_command "tsc"

# Check required directories
echo -e "\n${YELLOW}Checking required directories:${NC}"
check_dir "tests/selenium"
check_dir "tests/fixtures"
check_dir "tests/results"

# Check required files
echo -e "\n${YELLOW}Checking required files:${NC}"
check_file "tests/fixtures/test-meal.jpg"
check_file "tests/selenium/package.json"
check_file "tests/selenium/run-tests.ts"
check_file "tests/selenium/notifications.ts"
check_file ".github/workflows/selenium-tests.yml"

# Check package.json dependencies
echo -e "\n${YELLOW}Checking dependencies:${NC}"
if [ -f "tests/selenium/package.json" ]; then
    cd tests/selenium
    if npm install --dry-run &> /dev/null; then
        echo -e "${GREEN}✓ Dependencies are valid${NC}"
    else
        echo -e "${RED}✗ Dependencies are invalid${NC}"
    fi
    cd ../..
fi

# Check test meal image
if [ -f "tests/fixtures/test-meal.jpg" ]; then
    echo -e "\n${YELLOW}Checking test meal image:${NC}"
    file_size=$(stat -f%z "tests/fixtures/test-meal.jpg" 2>/dev/null || stat -c%s "tests/fixtures/test-meal.jpg")
    if [ "$file_size" -gt 2097152 ]; then
        echo -e "${RED}✗ Test meal image is too large (>2MB)${NC}"
    else
        echo -e "${GREEN}✓ Test meal image size is good${NC}"
    fi
fi

# Check GitHub Actions workflow
echo -e "\n${YELLOW}Checking GitHub Actions workflow:${NC}"
if [ -f ".github/workflows/selenium-tests.yml" ]; then
    if gh workflow view selenium-tests.yml &> /dev/null; then
        echo -e "${GREEN}✓ GitHub Actions workflow is valid${NC}"
    else
        echo -e "${RED}✗ GitHub Actions workflow is invalid${NC}"
    fi
fi

echo "----------------------------------------"
echo "Setup verification complete!" 