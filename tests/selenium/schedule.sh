#!/bin/bash

# NutriVision Selenium Test Scheduler
# This script runs the selenium tests and can be scheduled with cron
# Example crontab entry to run daily at 1 AM:
# 0 1 * * * /path/to/schedule.sh

# Move to the script directory
cd "$(dirname "$0")"

# Log file
LOG_DIR="../logs"
mkdir -p $LOG_DIR
LOG_FILE="$LOG_DIR/scheduled-test-$(date +%Y%m%d-%H%M%S).log"

# Environment variables
export TEST_BASE_URL="https://your-app-url.com"
export NOTIFY_ON_FAILURE="true"
export NOTIFICATION_EMAIL="alerts@yourcompany.com"
export HEADLESS="true"

# Initialize ChromeDriver (adjust path as needed)
function setup_chromedriver {
  echo "Setting up ChromeDriver..."
  
  # Check if ChromeDriver is installed
  if ! command -v chromedriver &> /dev/null; then
    echo "ChromeDriver not found. Please install ChromeDriver and make it available in PATH."
    exit 1
  fi
  
  # Start ChromeDriver in background if needed
  # chromedriver --port=4444 &
  # CHROMEDRIVER_PID=$!
  # echo "ChromeDriver started with PID: $CHROMEDRIVER_PID"
  # sleep 2
}

# Cleanup function
function cleanup {
  echo "Cleaning up..."
  # if [[ -n $CHROMEDRIVER_PID ]]; then
  #   kill $CHROMEDRIVER_PID
  # fi
}

# Run tests
function run_tests {
  echo "Running NutriVision Selenium tests..."
  npm run test
  return $?
}

# Main execution
{
  echo "=== NutriVision Selenium Test Run ==="
  echo "Started at: $(date)"
  echo "Environment: TEST_BASE_URL=$TEST_BASE_URL"
  
  setup_chromedriver
  
  # Run tests and capture exit code
  run_tests
  TEST_EXIT_CODE=$?
  
  cleanup
  
  echo "Tests completed with exit code: $TEST_EXIT_CODE"
  echo "Finished at: $(date)"
  
  exit $TEST_EXIT_CODE
} 2>&1 | tee -a "$LOG_FILE"

# Get the exit code from the tests
exit ${PIPESTATUS[0]} 