import React from 'react';
import { render, screen } from '@testing-library/react';
import UpgradePrompt from '../UpgradePrompt';

describe('UpgradePrompt', () => {
  it('should render all premium features', () => {
    render(<UpgradePrompt />);

    // Check main heading and description
    expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Get access to advanced AI-powered nutritional analysis and personalized recommendations.'
      )
    ).toBeInTheDocument();

    // Check feature headings
    expect(screen.getByText('Advanced Analysis')).toBeInTheDocument();
    expect(screen.getByText('Smart Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Allergen Detection')).toBeInTheDocument();

    // Check feature descriptions
    expect(
      screen.getByText('Detailed micronutrients and health insights')
    ).toBeInTheDocument();
    expect(screen.getByText('Personalized meal suggestions')).toBeInTheDocument();
    expect(screen.getByText('Identify potential allergens')).toBeInTheDocument();

    // Check upgrade button
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
  });

  it('should have correct link to subscription page', () => {
    render(<UpgradePrompt />);

    const upgradeButton = screen.getByText('Upgrade Now');
    expect(upgradeButton.closest('a')).toHaveAttribute('href', '/subscription');
  });

  it('should have correct styling classes', () => {
    render(<UpgradePrompt />);

    // Check gradient background
    expect(screen.getByTestId('upgrade-prompt')).toHaveClass(
      'bg-gradient-to-br',
      'from-purple-50',
      'to-blue-50'
    );

    // Check button gradient
    expect(screen.getByText('Upgrade Now')).toHaveClass(
      'bg-gradient-to-r',
      'from-purple-500',
      'to-blue-500'
    );
  });
}); 