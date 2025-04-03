import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap, Shield, Brain } from 'lucide-react';
import Link from 'next/link';

export function UpgradePrompt() {
  return (
    <div
      data-testid="upgrade-prompt"
      className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 bg-gradient-to-br from-purple-50 to-blue-50"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Upgrade to Premium</h3>
        </div>
        
        <p className="text-gray-600">
          Get access to advanced AI-powered nutritional analysis and personalized recommendations.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Advanced Analysis</h4>
              <p className="text-sm text-gray-500">Detailed micronutrients and health insights</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Smart Recommendations</h4>
              <p className="text-sm text-gray-500">Personalized meal suggestions</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Allergen Detection</h4>
              <p className="text-sm text-gray-500">Identify potential allergens</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Link href="/subscription">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Upgrade Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UpgradePrompt; 