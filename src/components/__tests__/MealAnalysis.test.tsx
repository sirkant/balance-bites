import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { analyzeMeal, generateMealRecommendations } from '@/services/ai';
import MealAnalysis from '../MealAnalysis';
import '@testing-library/jest-dom';

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

describe('MealAnalysis', () => {
  const mockImageUrl = 'test-image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the analysis form', () => {
    render(
      <MealAnalysis
        onAnalysisComplete={jest.fn()}
        onError={jest.fn()}
        isPremium={false}
        imageUrl={mockImageUrl}
      />
    );

    expect(screen.getByLabelText(/Upload Image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze meal/i })).toBeInTheDocument();
  });

  it('handles image upload and analysis', async () => {
    const mockOnAnalysisComplete = jest.fn();
    const mockOnError = jest.fn();
    const mockAnalysisResult = {
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
    const mockRecommendations = ['Use brown rice instead'];

    (analyzeMeal as jest.Mock).mockResolvedValueOnce(mockAnalysisResult);
    (generateMealRecommendations as jest.Mock).mockResolvedValueOnce(mockRecommendations);

    render(
      <MealAnalysis
        onAnalysisComplete={mockOnAnalysisComplete}
        onError={mockOnError}
        isPremium={false}
        imageUrl={mockImageUrl}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Upload Image/i);
    fireEvent.change(input, { target: { files: [file] } });

    const analyzeButton = screen.getByRole('button', { name: /analyze meal/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(analyzeMeal).toHaveBeenCalledWith(mockImageUrl, false);
      expect(mockOnAnalysisComplete).toHaveBeenCalledWith(mockAnalysisResult, mockAnalysisResult.recommendations);
    });
  });

  it('displays premium tier analysis results', async () => {
    const mockOnAnalysisComplete = jest.fn();
    const mockOnError = jest.fn();
    const mockAnalysisResult = {
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
    const mockRecommendations = ['Use brown rice instead'];

    (analyzeMeal as jest.Mock).mockResolvedValueOnce(mockAnalysisResult);
    (generateMealRecommendations as jest.Mock).mockResolvedValueOnce(mockRecommendations);

    render(
      <MealAnalysis
        onAnalysisComplete={mockOnAnalysisComplete}
        onError={mockOnError}
        isPremium={true}
        imageUrl={mockImageUrl}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Upload Image/i);
    fireEvent.change(input, { target: { files: [file] } });

    const analyzeButton = screen.getByRole('button', { name: /analyze meal/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(analyzeMeal).toHaveBeenCalledWith(mockImageUrl, true);
      expect(generateMealRecommendations).toHaveBeenCalled();
      expect(mockOnAnalysisComplete).toHaveBeenCalledWith(mockAnalysisResult, mockAnalysisResult.recommendations);
    });
  });

  it('handles analysis errors', async () => {
    const mockOnAnalysisComplete = jest.fn();
    const mockOnError = jest.fn();
    const mockError = new Error('Failed to analyze meal');

    (analyzeMeal as jest.Mock).mockRejectedValueOnce(mockError);

    render(
      <MealAnalysis
        onAnalysisComplete={mockOnAnalysisComplete}
        onError={mockOnError}
        isPremium={false}
        imageUrl={mockImageUrl}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Upload Image/i);
    fireEvent.change(input, { target: { files: [file] } });

    const analyzeButton = screen.getByRole('button', { name: /analyze meal/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });
}); 