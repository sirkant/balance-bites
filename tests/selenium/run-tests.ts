/**
 * Selenium Test Runner
 * 
 * This script runs all Selenium tests and reports results
 * Can be used in CI/CD pipelines or scheduled jobs
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';
import { sendNotification } from './notifications';

// Configure notification settings
const NOTIFY_ON_FAILURE = process.env.NOTIFY_ON_FAILURE === 'true';
const NOTIFICATION_TYPE = process.env.NOTIFICATION_TYPE || 'email';

// Test files to run
const TEST_FILES = [
  './signup.test.ts',
  './meal-upload.test.ts'
];

// Create results directory if it doesn't exist
const resultsDir = path.join(__dirname, '../results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Get timestamp for logs
const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
const logFile = path.join(resultsDir, `test-run-${timestamp}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Log helper function
const log = (message: string) => {
  const timePrefix = format(new Date(), 'HH:mm:ss');
  const logMessage = `[${timePrefix}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
};

// Run a test file
const runTest = (testFile: string): Promise<boolean> => {
  return new Promise((resolve) => {
    log(`Starting test: ${testFile}`);
    
    // Use ts-node to run the TypeScript test file
    const process = spawn('npx', ['ts-node', testFile], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: __dirname
    });
    
    // Capture output
    process.stdout.on('data', (data) => {
      log(`[${testFile}] ${data.toString().trim()}`);
    });
    
    process.stderr.on('data', (data) => {
      log(`[${testFile}] ERROR: ${data.toString().trim()}`);
    });
    
    // Handle process exit
    process.on('close', (code) => {
      const success = code === 0;
      log(`Test ${testFile} ${success ? 'PASSED' : 'FAILED'} with exit code ${code}`);
      resolve(success);
    });
  });
};

// Main function
const runTests = async () => {
  log('Starting NutriVision Selenium tests');
  
  let allPassed = true;
  const results: Array<{ file: string; success: boolean }> = [];
  
  // Run each test sequentially
  for (const testFile of TEST_FILES) {
    const success = await runTest(testFile);
    results.push({ file: testFile, success });
    
    if (!success) {
      allPassed = false;
    }
  }
  
  // Log summary
  log('\n--- Test Run Summary ---');
  results.forEach(({ file, success }) => {
    log(`${file}: ${success ? 'PASSED' : 'FAILED'}`);
  });
  
  // Send notification if any tests failed
  if (!allPassed && NOTIFY_ON_FAILURE) {
    const failedTests = results.filter(r => !r.success).map(r => r.file).join(', ');
    const subject = 'NutriVision Selenium Tests Failed';
    const body = `The following tests failed: ${failedTests}. Check logs for details.`;
    
    try {
      await sendNotification({
        type: NOTIFICATION_TYPE as 'email' | 'github',
        subject,
        body,
        attachments: [logFile]
      });
      log('Notification sent successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      log(`Failed to send notification: ${errorMessage}`);
    }
  }
  
  log(`All tests ${allPassed ? 'PASSED' : 'FAILED'}`);
  logStream.end();
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
};

// Run the tests
runTests().catch(error => {
  log(`Unhandled error: ${error.message}`);
  logStream.end();
  process.exit(1);
}); 