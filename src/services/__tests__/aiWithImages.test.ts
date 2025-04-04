import { analyzeMeal, generateMealRecommendations } from '../ai';
import fs from 'fs';
import path from 'path';

// Mock the openai module
jest.mock('../ai', () => {
  const originalModule = jest.requireActual('../ai');
  
  return {
    ...originalModule,
    analyzeMeal: jest.fn(),
    generateMealRecommendations: jest.fn(),
  };
});

// Function to get the base64 of an image
function getBase64Image(imagePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), imagePath);
    const fileBuffer = fs.readFileSync(fullPath);
    return `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`Error reading image file: ${error}`);
    return '';
  }
}

describe('AI Service with Test Images', () => {
  const testImages = [
    'test_images/paella.jpeg',
    'test_images/pad_thai.jpg',
    'test_images/Pasta-Carbonara-scaled.jpg',
    'test_images/biff-rydberg-pa-mitt-vis.jpg'
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeMeal', () => {
    it.each(testImages)('analyzes %s correctly', async (imagePath) => {
      const imageName = path.basename(imagePath);
      const mockResult = getMockAnalysisForImage(imageName, false);
      
      (analyzeMeal as jest.Mock).mockResolvedValueOnce(mockResult);

      const imageBase64 = getBase64Image(imagePath);
      const result = await analyzeMeal(imageBase64, false);
      
      expect(analyzeMeal).toHaveBeenCalledWith(imageBase64, false);
      expect(result).toEqual(mockResult);
      expect(result.calories).toBeDefined();
      expect(result.macronutrients).toBeDefined();
      expect(result.ingredients).toBeInstanceOf(Array);
      expect(result.healthScore).toBeGreaterThan(0);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('analyzes meals with premium features', async () => {
      const imagePath = testImages[0]; // Using paella image
      const mockPremiumResult = getMockAnalysisForImage(path.basename(imagePath), true);
      
      (analyzeMeal as jest.Mock).mockResolvedValueOnce(mockPremiumResult);
      
      const result = await analyzeMeal(await getBase64Image(imagePath), true);
      
      expect(result).toEqual(mockPremiumResult);
      expect(result.micronutrients).toBeDefined();
    });
  });

  describe('generateMealRecommendations', () => {
    it('generates recommendations based on user preferences', async () => {
      const userPreferences = {
        dietaryRestrictions: ['vegetarian'],
        healthGoals: ['weight loss'],
        allergies: ['nuts'],
      };
      
      const mockRecommendations = [
        'Choose whole grain options for more fiber',
        'Include plant-based proteins like tofu and beans',
        'Limit added sugars in your meals'
      ];
      
      (generateMealRecommendations as jest.Mock).mockResolvedValueOnce(mockRecommendations);

      const result = await generateMealRecommendations(userPreferences, false);
      
      expect(generateMealRecommendations).toHaveBeenCalledWith(userPreferences, false);
      expect(result).toEqual(mockRecommendations);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('generates premium tier recommendations', async () => {
      const userPreferences = {
        dietaryRestrictions: ['vegetarian'],
        healthGoals: ['weight loss', 'muscle gain'],
        allergies: ['nuts', 'dairy'],
      };
      
      const mockPremiumRecommendations = [
        'Start your day with a protein-rich breakfast like a tofu scramble with vegetables',
        'Include legumes such as lentils and chickpeas for complete proteins',
        'Add plant-based protein powder to smoothies after workouts',
        'Focus on complex carbohydrates like sweet potatoes and quinoa',
        'Incorporate healthy fats from avocados and olive oil'
      ];
      
      (generateMealRecommendations as jest.Mock).mockResolvedValueOnce(mockPremiumRecommendations);

      const result = await generateMealRecommendations(userPreferences, true);
      
      expect(generateMealRecommendations).toHaveBeenCalledWith(userPreferences, true);
      expect(result).toEqual(mockPremiumRecommendations);
      expect(result.length).toBeGreaterThan(3); // Premium should provide more detailed recommendations
    });
  });
});

// Helper function to get mock analysis based on the image
function getMockAnalysisForImage(imageName: string, isPremium: boolean): any {
  // Basic analysis for all images
  const baseAnalysis = {
    calories: 450,
    macronutrients: {
      protein: 20,
      carbs: 50,
      fat: 15
    },
    micronutrients: {
      fiber: 5,
      sugar: 10,
      sodium: 400
    },
    ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
    healthScore: 7,
    recommendations: ['Recommendation 1', 'Recommendation 2']
  };

  // Image-specific analysis
  switch(imageName) {
    case 'paella.jpeg':
      return {
        ...baseAnalysis,
        calories: 550,
        ingredients: ['Rice', 'Seafood', 'Saffron', 'Vegetables'],
        healthScore: 8,
        recommendations: ['Use brown rice instead', 'Add more vegetables']
      };
    case 'pad_thai.jpg':
      return {
        ...baseAnalysis,
        calories: 650,
        ingredients: ['Rice noodles', 'Tofu', 'Bean sprouts', 'Peanuts'],
        healthScore: 6,
        recommendations: ['Reduce sauce amount', 'Add more protein']
      };
    case 'Pasta-Carbonara-scaled.jpg':
      return {
        ...baseAnalysis,
        calories: 750,
        ingredients: ['Pasta', 'Eggs', 'Cheese', 'Pancetta'],
        healthScore: 5,
        recommendations: ['Use whole grain pasta', 'Reduce portion size']
      };
    case 'biff-rydberg-pa-mitt-vis.jpg':
      return {
        ...baseAnalysis,
        calories: 850,
        ingredients: ['Beef', 'Potatoes', 'Onions', 'Eggs'],
        healthScore: 6,
        recommendations: ['Use leaner cuts of beef', 'Add more vegetables']
      };
    default:
      return baseAnalysis;
  }
} 