# Test Fixtures

This directory contains test data used by the Selenium tests.

## Required Files

1. `test-meal.jpg`: A sample meal image for testing the meal upload functionality
   - Should be a clear, well-lit photo of a meal
   - Recommended size: 800x600 pixels
   - Format: JPEG
   - File size: < 2MB

## Setup Instructions

1. Add your test meal image:
   ```bash
   # From the project root
   cp path/to/your/meal-image.jpg tests/fixtures/test-meal.jpg
   ```

2. Verify the image:
   ```bash
   file tests/fixtures/test-meal.jpg
   # Should show: JPEG image data
   ```

## Notes

- The test meal image should be representative of a typical meal that users might upload
- Avoid using copyrighted images
- Keep the file size reasonable to ensure fast test execution 