import { WebDriver, By, until } from 'selenium-webdriver';
import { setupDriver, navigateTo, takeScreenshot, TEST_EMAIL, TEST_PASSWORD } from './setup';

describe('User Signup Flow', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await setupDriver();
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should allow a new user to sign up', async () => {
    try {
      // Navigate to auth page
      await navigateTo(driver, '/auth');
      
      // Generate unique email to avoid conflicts
      const uniqueEmail = `test_${Date.now()}@example.com`;
      
      // Switch to sign up tab if needed
      try {
        const signUpTab = await driver.findElement(By.xpath("//button[contains(text(), 'Sign Up')]"));
        await signUpTab.click();
      } catch (error) {
        console.log("Already on sign up form or tab not found");
      }
      
      // Fill in the sign up form
      await driver.findElement(By.id('email')).sendKeys(uniqueEmail);
      await driver.findElement(By.id('password')).sendKeys(TEST_PASSWORD);
      
      // Click the sign up button
      const signUpButton = await driver.findElement(By.xpath("//button[contains(text(), 'Create Account')]"));
      await signUpButton.click();
      
      // Wait for successful signup - should redirect to dashboard
      await driver.wait(
        until.elementLocated(By.xpath("//h1[contains(text(), 'NutriVision Dashboard')]")), 
        15000
      );
      
      // Take a screenshot for verification
      await takeScreenshot(driver, 'successful_signup');
      
      // Assert - check if we're on the dashboard
      const dashboardHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'NutriVision Dashboard')]"));
      expect(await dashboardHeading.isDisplayed()).toBe(true);
      
      // Additional verification - check if user data is shown
      const userEmailElement = await driver.findElement(By.xpath(`//*[contains(text(), '${uniqueEmail}')]`));
      expect(await userEmailElement.isDisplayed()).toBe(true);
      
      console.log('User signup test passed successfully');
    } catch (error) {
      // Take screenshot on failure
      await takeScreenshot(driver, 'signup_failure');
      console.error('Signup test failed:', error);
      throw error;
    }
  }, 30000); // Extend timeout for this test
}); 