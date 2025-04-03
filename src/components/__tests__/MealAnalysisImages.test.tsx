import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { analyzeMeal, generateMealRecommendations } from '@/services/ai';
import MealAnalysis from '../MealAnalysis';
import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// Mock the useSubscription hook
jest.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    isPremium: false,
    isLoading: false,
    error: null,
    isSubscribed: false,
    isCanceled: false,
  }),
}));

// Mock the AI service functions
jest.mock('@/services/ai', () => ({
  analyzeMeal: jest.fn(),
  generateMealRecommendations: jest.fn(),
}));

// Function to get the base64 of an image
function getBase64Image(imagePath: string): string {
  try {
    // In a real test environment, paths would be relative to the project root
    const fullPath = path.join(process.cwd(), imagePath);
    const fileBuffer = fs.readFileSync(fullPath);
    return `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`Error reading image file: ${error}`);
    return '';
  }
}

describe('MealAnalysis with Test Images', () => {
  const testImages = [
    'test_images/paella.jpeg',
    'test_images/pad_thai.jpg',
    'test_images/Pasta-Carbonara-scaled.jpg',
    'test_images/biff-rydberg-pa-mitt-vis.jpg'
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(testImages)('analyzes %s correctly', async (imagePath) => {
    const mockOnAnalysisComplete = jest.fn();
    const mockOnError = jest.fn();
    
    // Set up a mock analysis result based on the image type
    const imageName = path.basename(imagePath);
    const mockAnalysisResult = getMockAnalysisForImage(imageName);
    
    (analyzeMeal as jest.Mock).mockResolvedValueOnce(mockAnalysisResult);
    (generateMealRecommendations as jest.Mock).mockResolvedValueOnce(mockAnalysisResult.recommendations);

    const imageBase64 = getBase64Image(imagePath);
    
    render(
      <MealAnalysis
        onAnalysisComplete={mockOnAnalysisComplete}
        onError={mockOnError}
        isPremium={false}
        imageUrl={imageBase64}
      />
    );

    const file = new File(['test'], imageName, { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Upload Image/i);
    fireEvent.change(input, { target: { files: [file] } });

    const analyzeButton = screen.getByRole('button', { name: /analyze meal/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(analyzeMeal).toHaveBeenCalledWith(imageBase64, false);
      expect(mockOnAnalysisComplete).toHaveBeenCalledWith(mockAnalysisResult, mockAnalysisResult.recommendations);
    });
    
    // Verify the analysis results are displayed correctly
    expect(screen.getByText(`${mockAnalysisResult.calories} kcal`)).toBeInTheDocument();
    expect(screen.getByText(`${mockAnalysisResult.healthScore}/10`)).toBeInTheDocument();
    
    mockAnalysisResult.ingredients.forEach(ingredient => {
      expect(screen.getByText(ingredient)).toBeInTheDocument();
    });
    
    mockAnalysisResult.recommendations.forEach(recommendation => {
      expect(screen.getByText(recommendation)).toBeInTheDocument();
    });
  });

  it('provides premium analysis for premium users', async () => {
    const mockOnAnalysisComplete = jest.fn();
    const mockOnError = jest.fn();
    const imagePath = testImages[0]; // Using the first test image
    
    // Create a premium mock result with additional details
    const mockPremiumResult = {
      ...getMockAnalysisForImage(path.basename(imagePath)),
      micronutrients: {
        fiber: 8,
        sugar: 5,
        sodium: 850,
      },
      allergens: ['shellfish', 'gluten'],
      benefits: ['Rich in protein', 'Contains essential vitamins'],
      warnings: ['High sodium content']
    };
    
    (analyzeMeal as jest.Mock).mockResolvedValueOnce(mockPremiumResult);
    (generateMealRecommendations as jest.Mock).mockResolvedValueOnce([
      'Switch to brown rice for more fiber',
      'Reduce salt during cooking',
      'Add more vegetables for additional nutrients'
    ]);

    const imageBase64 = getBase64Image(imagePath);
    
    render(
      <MealAnalysis
        onAnalysisComplete={mockOnAnalysisComplete}
        onError={mockOnError}
        isPremium={true}
        imageUrl={imageBase64}
      />
    );

    const file = new File(['test'], path.basename(imagePath), { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Upload Image/i);
    fireEvent.change(input, { target: { files: [file] } });

    const analyzeButton = screen.getByRole('button', { name: /analyze meal/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(analyzeMeal).toHaveBeenCalledWith(imageBase64, true);
      expect(generateMealRecommendations).toHaveBeenCalled();
    });
    
    // Verify premium-specific elements are displayed
    expect(screen.getByText('Micronutrients')).toBeInTheDocument();
    expect(screen.getByText('8g')).toBeInTheDocument(); // Fiber content
    expect(screen.getByText('Potential Allergens')).toBeInTheDocument();
    expect(screen.getByText('shellfish')).toBeInTheDocument();
    expect(screen.getByText('Nutritional Benefits')).toBeInTheDocument();
    expect(screen.getByText('Rich in protein')).toBeInTheDocument();
  });
});

// Helper function to get mock analysis based on the image
function getMockAnalysisForImage(imageName: string): any {
  if (imageName.includes('paella')) {
    return {
      calories: 650,
      macronutrients: {
        protein: 28,
        carbs: 80,
        fat: 18,
      },
      ingredients: ['rice', 'seafood', 'saffron', 'peas', 'bell peppers'],
      healthScore: 7,
      recommendations: ['Reduce oil amount', 'Add more vegetables']
    };
  } else if (imageName.includes('pad_thai')) {
    return {
      calories: 580,
      macronutrients: {
        protein: 22,
        carbs: 70,
        fat: 20,
      },
      ingredients: ['rice noodles', 'tofu', 'bean sprouts', 'peanuts', 'eggs'],
      healthScore: 6,
      recommendations: ['Use less oil', 'Add more vegetables']
    };
  } else if (imageName.includes('Pasta-Carbonara')) {
    return {
      calories: 750,
      macronutrients: {
        protein: 25,
        carbs: 85,
        fat: 35,
      },
      ingredients: ['pasta', 'eggs', 'bacon', 'parmesan', 'black pepper'],
      healthScore: 5,
      recommendations: ['Use whole grain pasta', 'Reduce portion size', 'Add vegetables']
    };
  } else {
    // Default for biff-rydberg or unknown images
    return {
      calories: 700,
      macronutrients: {
        protein: 35,
        carbs: 45,
        fat: 40,
      },
      ingredients: ['beef', 'potatoes', 'onions', 'eggs'],
      healthScore: 6,
      recommendations: ['Use leaner cuts of beef', 'Add more vegetables']
    };
  }
} 