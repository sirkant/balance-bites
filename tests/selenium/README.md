# NutriVision Selenium Tests

This directory contains automated Selenium tests for the NutriVision application. The tests verify critical user flows such as account creation and meal upload functionality.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Install ChromeDriver (must match your Chrome version):
   ```
   npm install -g chromedriver
   ```

3. Create test fixtures:
   - Add a test meal image to `../fixtures/test-meal.jpg`
   - This image will be used for meal upload tests

## Running Tests

Run all tests:
```
npm test
```

Run specific tests:
```
npm run test:signup    # Run signup test only
npm run test:upload    # Run meal upload test only
```

## Scheduled Testing

To schedule tests to run daily:

1. Make the scheduling script executable:
   ```
   chmod +x schedule.sh
   ```

2. Configure the environment variables in `schedule.sh`:
   - `TEST_BASE_URL`: URL of the application
   - `NOTIFY_ON_FAILURE`: Set to "true" to enable failure notifications
   - `NOTIFICATION_EMAIL`: Email to send alerts to

3. Add to crontab to run daily:
   ```
   0 1 * * * /absolute/path/to/schedule.sh
   ```

## Test Structure

- `setup.ts`: Configuration and helper functions
- `signup.test.ts`: Tests user account creation
- `meal-upload.test.ts`: Tests meal upload and analysis 
- `run-tests.ts`: Test runner that executes all tests
- `schedule.sh`: Shell script for scheduled runs

## Notification Setup

For alerting on test failures, you'll need to:

1. Implement the `sendNotification` function in `run-tests.ts`
2. Use an email service like Nodemailer or an alerting system like PagerDuty

## Troubleshooting

- **ChromeDriver version mismatch**: Ensure your ChromeDriver version matches your Chrome browser
- **Screenshots**: If tests fail, check the screenshots in the `../screenshots` directory
- **Logs**: Detailed logs are saved in the `../logs` directory 