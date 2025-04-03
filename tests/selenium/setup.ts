import { Builder, WebDriver, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { addDays, format } from 'date-fns';
import fs from 'fs';
import path from 'path';
import { Options } from 'selenium-webdriver/chrome';

// Configure Chrome options
const options = new Options();
if (process.env.HEADLESS === 'true') {
  options.addArguments('--headless');
}
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('--window-size=1920,1080');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get the base URL from environment variable
const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Test credentials - in a real environment these should be generated dynamically 
// or pulled from a secure source
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'Test1234!';

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 10000;

// Initialize WebDriver
export const setupDriver = async (): Promise<WebDriver> => {
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  // Set an implicit wait to avoid having to set waits for each element
  await driver.manage().setTimeouts({ implicit: DEFAULT_TIMEOUT });
  
  return driver;
};

// Helper function to navigate to a page
export const navigateTo = async (driver: WebDriver, path: string): Promise<void> => {
  await driver.get(`${baseUrl}${path}`);
};

// Helper to log into the application
export const login = async (driver: WebDriver, email: string, password: string): Promise<void> => {
  await navigateTo(driver, '/auth');
  
  // Wait for the auth page to load and find the login form
  await driver.wait(until.elementLocated(By.id('email')), DEFAULT_TIMEOUT);
  
  // Enter email and password
  await driver.findElement(By.id('email')).sendKeys(email);
  await driver.findElement(By.id('password')).sendKeys(password);
  
  // Click the login button
  const loginButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]"));
  await loginButton.click();
  
  // Wait for the dashboard to load, indicating successful login
  await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'NutriVision Dashboard')]")), DEFAULT_TIMEOUT);
};

// Helper to sign up a new user
export const signUp = async (driver: WebDriver, email: string = TEST_EMAIL, password: string = TEST_PASSWORD): Promise<void> => {
  await navigateTo(driver, '/auth');
  
  // Wait for the auth page to load
  await driver.wait(until.elementLocated(By.id('email')), DEFAULT_TIMEOUT);
  
  // Check if we need to switch to sign up form
  try {
    const signUpTab = await driver.findElement(By.xpath("//button[contains(text(), 'Sign Up')]"));
    await signUpTab.click();
  } catch (error) {
    // If error, we might already be on sign up form, continue
    console.log("Already on sign up form or error finding tab:", error);
  }
  
  // Fill out the sign up form
  await driver.findElement(By.id('email')).sendKeys(email);
  await driver.findElement(By.id('password')).sendKeys(password);
  
  // Submit the form
  const signUpButton = await driver.findElement(By.xpath("//button[contains(text(), 'Create Account')]"));
  await signUpButton.click();
  
  // Wait for dashboard to load
  await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'NutriVision Dashboard')]")), DEFAULT_TIMEOUT * 2);
};

// Helper to take a screenshot
export const takeScreenshot = async (driver: WebDriver, testName: string): Promise<string> => {
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  const fileName = `${testName}_${timestamp}.png`;
  const filePath = path.join(screenshotsDir, fileName);
  
  const screenshot = await driver.takeScreenshot();
  fs.writeFileSync(filePath, screenshot, 'base64');
  
  return filePath;
};

// Helper to get a test image path
export const getTestImagePath = (): string => {
  const imagePath = path.join(__dirname, '../fixtures/test-meal.jpg');
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Test image not found at ${imagePath}`);
  }
  return imagePath;
};

// Helper function to wait for an element to be visible
export async function waitForElement(driver: WebDriver, selector: string, timeout = 10000): Promise<void> {
  await driver.wait(until.elementLocated(By.css(selector)), timeout);
  await driver.wait(until.elementIsVisible(driver.findElement(By.css(selector))), timeout);
}

// Helper function to wait for an element to be clickable
export async function waitForClickable(driver: WebDriver, selector: string, timeout = 10000): Promise<void> {
  await driver.wait(until.elementLocated(By.css(selector)), timeout);
  await driver.wait(until.elementIsEnabled(driver.findElement(By.css(selector))), timeout);
}

// Export common constants
export {
  baseUrl,
  TEST_EMAIL,
  TEST_PASSWORD,
  DEFAULT_TIMEOUT
}; 