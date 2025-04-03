// Increase timeout for all tests
jest.setTimeout(30000);

// Set default environment variables if not set
process.env.TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
process.env.HEADLESS = process.env.HEADLESS || 'false';
process.env.NOTIFY_ON_FAILURE = process.env.NOTIFY_ON_FAILURE || 'false'; 