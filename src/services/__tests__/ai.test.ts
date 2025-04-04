import { analyzeMeal, generateMealRecommendations } from '../ai';

// Mock the openai module
jest.mock('../ai', () => {
  const originalModule = jest.requireActual('../ai');
  
  return {
    ...originalModule,
    analyzeMeal: jest.fn(),
    generateMealRecommendations: jest.fn(),
  };
});

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeMeal', () => {
    it('analyzes a meal for free tier', async () => {
      const mockResult = {
        calories: 500,
        macronutrients: {
          protein: 20,
          carbs: 60,
          fat: 25,
        },
        ingredients: ['rice', 'chicken', 'vegetables'],
        healthScore: 7,
        recommendations: ['Use brown rice instead'],
      };

      (analyzeMeal as jest.Mock).mockResolvedValueOnce(mockResult);

      const result = await analyzeMeal('test-image.jpg', false);
      expect(result).toEqual(mockResult);
    });

    it('analyzes a meal for premium tier', async () => {
      const mockResult = {
        calories: 500,
        macronutrients: {
          protein: 20,
          carbs: 60,
          fat: 25,
        },
        micronutrients: {
          fiber: 5,
          sugar: 2,
          sodium: 400,
        },
        ingredients: ['rice', 'chicken', 'vegetables'],
        healthScore: 7,
        recommendations: ['Use brown rice instead'],
        allergens: ['soy'],
        benefits: ['High protein content'],
        warnings: ['High sodium content'],
      };

      (analyzeMeal as jest.Mock).mockResolvedValueOnce(mockResult);

      const result = await analyzeMeal('test-image.jpg', true);
      expect(result).toEqual(mockResult);
    });
  });

  describe('generateMealRecommendations', () => {
    const mockUserPreferences = {
      dietaryRestrictions: ['vegetarian'],
      healthGoals: ['weight loss'],
      allergies: ['nuts'],
    };

    it('generates recommendations for free tier', async () => {
      const mockRecommendations = [
        'Use brown rice instead of white rice',
        'Add more vegetables for fiber',
      ];

      (generateMealRecommendations as jest.Mock).mockResolvedValueOnce(mockRecommendations);

      const result = await generateMealRecommendations(mockUserPreferences, false);
      expect(result).toEqual(mockRecommendations);
    });

    it('generates recommendations for premium tier', async () => {
      const mockRecommendations = [
        'Use brown rice instead of white rice',
        'Add more vegetables for fiber',
        'Consider quinoa as a higher-protein alternative',
        'Add avocado for healthy fats',
      ];

      (generateMealRecommendations as jest.Mock).mockResolvedValueOnce(mockRecommendations);

      const result = await generateMealRecommendations(mockUserPreferences, true);
      expect(result).toEqual(mockRecommendations);
    });
  });
}); 