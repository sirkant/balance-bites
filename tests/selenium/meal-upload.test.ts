import { WebDriver, By, until } from 'selenium-webdriver';
import { setupDriver, navigateTo, login, takeScreenshot, getTestImagePath, TEST_EMAIL, TEST_PASSWORD } from './setup';
import path from 'path';

describe('Meal Upload Flow', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await setupDriver();
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should allow a logged in user to upload a meal and view analysis', async () => {
    try {
      // First login to the application
      await login(driver, TEST_EMAIL, TEST_PASSWORD);
      
      // Navigate to upload page
      await navigateTo(driver, '/upload');
      
      // Wait for upload page to load
      await driver.wait(
        until.elementLocated(By.xpath("//h1[contains(text(), 'Upload Your Meal Photo')]")), 
        10000
      );
      
      // Find the file input and upload the test image
      const fileInput = await driver.findElement(By.css('input[type="file"]'));
      const testImagePath = getTestImagePath();
      await fileInput.sendKeys(testImagePath);
      
      // Wait for image preview to appear
      await driver.wait(
        until.elementLocated(By.css('img[alt="Meal preview"]')), 
        10000
      );
      
      // Take screenshot of the preview
      await takeScreenshot(driver, 'meal_preview');
      
      // Click the analyze button
      const analyzeButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Analyze Nutrition')]")
      );
      await analyzeButton.click();
      
      // Wait for analysis to complete (this might take some time)
      await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Nutritional Analysis')]")),
        60000 // Longer timeout for API call and analysis
      );
      
      // Take screenshot of results
      await takeScreenshot(driver, 'meal_analysis_results');
      
      // Verify result page contains expected elements
      const nutritionHeading = await driver.findElement(
        By.xpath("//*[contains(text(), 'Nutritional Analysis')]")
      );
      expect(await nutritionHeading.isDisplayed()).toBe(true);
      
      // Check for calories display
      const caloriesElement = await driver.findElement(
        By.xpath("//*[contains(text(), 'Calories')]")
      );
      expect(await caloriesElement.isDisplayed()).toBe(true);
      
      // Check for macronutrients display
      const macronutrientsElement = await driver.findElement(
        By.xpath("//*[contains(text(), 'Macronutrients')]")
      );
      expect(await macronutrientsElement.isDisplayed()).toBe(true);
      
      console.log('Meal upload test passed successfully');
    } catch (error) {
      // Take screenshot on failure
      await takeScreenshot(driver, 'meal_upload_failure');
      console.error('Meal upload test failed:', error);
      throw error;
    }
  }, 90000); // Extended timeout for this test since meal analysis can take time
}); 