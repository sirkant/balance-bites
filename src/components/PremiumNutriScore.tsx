import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Info, Check, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NutrientBreakdown {
  sugar?: {
    amount: number;
    unit: string;
    level: string;
  };
  salt?: {
    amount: number;
    unit: string;
    level: string;
  };
  fiber?: {
    amount: number;
    unit: string;
    level: string;
  };
  proteinQuality?: string;
  saturatedFat?: {
    amount: number;
    unit: string;
    level: string;
  };
}

interface PremiumNutriScoreProps {
  overallNutriScore?: string;
  nutrientBreakdown?: NutrientBreakdown;
  micronutrients?: {
    vitamins?: string[];
    minerals?: string[];
  };
  personalizedRecommendations?: string[];
}

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'low':
      return 'bg-green-500';
    case 'moderate':
      return 'bg-yellow-500';
    case 'high':
      return 'bg-red-500';
    case 'good':
      return 'bg-green-400';
    case 'excellent':
      return 'bg-green-600';
    default:
      return 'bg-gray-500';
  }
};

const getLevelTextColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'low':
      return 'text-green-500';
    case 'moderate':
      return 'text-yellow-500';
    case 'high':
      return 'text-red-500';
    case 'good':
      return 'text-green-400';
    case 'excellent':
      return 'text-green-600';
    default:
      return 'text-gray-500';
  }
};

const getBadgeVariant = (level: string) => {
  switch (level.toLowerCase()) {
    case 'low':
    case 'good':
    case 'excellent':
      return 'outline';
    case 'moderate':
      return 'secondary';
    case 'high':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getNutriScoreLabel = (score: string) => {
  switch (score) {
    case 'A':
      return { color: 'bg-green-500', text: 'Excellent' };
    case 'B':
      return { color: 'bg-green-400', text: 'Good' };
    case 'C':
      return { color: 'bg-yellow-500', text: 'Average' };
    case 'D':
      return { color: 'bg-orange-500', text: 'Below Average' };
    case 'E':
      return { color: 'bg-red-500', text: 'Poor' };
    default:
      return { color: 'bg-gray-500', text: 'Unknown' };
  }
};

const NutrientIndicator = ({ 
  name, 
  amount, 
  unit, 
  level 
}: { 
  name: string; 
  amount: number; 
  unit: string; 
  level: string;
}) => {
  const levelColor = getLevelColor(level);
  const textColor = getLevelTextColor(level);
  const badgeVariant = getBadgeVariant(level);
  
  // Calculate a visual percentage based on the level
  let percentage = 50; // Default for moderate
  if (level.toLowerCase() === 'low' || level.toLowerCase() === 'excellent') percentage = 25;
  if (level.toLowerCase() === 'high') percentage = 85;
  if (level.toLowerCase() === 'good') percentage = 60;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm">{amount}{unit}</span>
          <Badge variant={badgeVariant as any} className={`${textColor} px-2 py-0.5`}>
            {level}
          </Badge>
        </div>
      </div>
      
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className={`${levelColor} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const PremiumNutriScore: React.FC<PremiumNutriScoreProps> = ({
  overallNutriScore,
  nutrientBreakdown,
  micronutrients,
  personalizedRecommendations,
}) => {
  if (!overallNutriScore || !nutrientBreakdown) {
    return null;
  }
  
  const nutriScore = getNutriScoreLabel(overallNutriScore);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>
              Enhanced NutriScore™
              <Badge className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                Premium
              </Badge>
            </span>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${nutriScore.color} text-white font-bold text-xl`}>
              {overallNutriScore}
            </div>
          </CardTitle>
          <CardDescription>
            Comprehensive nutritional rating based on advanced criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breakdown">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakdown">Nutrient Breakdown</TabsTrigger>
              <TabsTrigger value="micronutrients">Micronutrients</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakdown" className="space-y-4 pt-4">
              <div className="space-y-4">
                {nutrientBreakdown.sugar && (
                  <NutrientIndicator 
                    name="Sugar" 
                    amount={nutrientBreakdown.sugar.amount} 
                    unit={nutrientBreakdown.sugar.unit} 
                    level={nutrientBreakdown.sugar.level}
                  />
                )}
                
                {nutrientBreakdown.salt && (
                  <NutrientIndicator 
                    name="Salt" 
                    amount={nutrientBreakdown.salt.amount} 
                    unit={nutrientBreakdown.salt.unit} 
                    level={nutrientBreakdown.salt.level}
                  />
                )}
                
                {nutrientBreakdown.fiber && (
                  <NutrientIndicator 
                    name="Fiber" 
                    amount={nutrientBreakdown.fiber.amount} 
                    unit={nutrientBreakdown.fiber.unit} 
                    level={nutrientBreakdown.fiber.level}
                  />
                )}
                
                {nutrientBreakdown.saturatedFat && (
                  <NutrientIndicator 
                    name="Saturated Fat" 
                    amount={nutrientBreakdown.saturatedFat.amount} 
                    unit={nutrientBreakdown.saturatedFat.unit} 
                    level={nutrientBreakdown.saturatedFat.level}
                  />
                )}
                
                {nutrientBreakdown.proteinQuality && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium">Protein Quality</span>
                    <Badge 
                      variant={
                        nutrientBreakdown.proteinQuality.toLowerCase() === "complete" 
                          ? "outline" 
                          : nutrientBreakdown.proteinQuality.toLowerCase() === "moderate"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        nutrientBreakdown.proteinQuality.toLowerCase() === "complete"
                          ? "text-green-500" 
                          : nutrientBreakdown.proteinQuality.toLowerCase() === "moderate"
                            ? "text-yellow-500"
                            : "text-red-500"
                      }
                    >
                      {nutrientBreakdown.proteinQuality}
                    </Badge>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="micronutrients" className="space-y-4 pt-4">
              {micronutrients?.vitamins && micronutrients.vitamins.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Vitamins</h3>
                  <div className="flex flex-wrap gap-2">
                    {micronutrients.vitamins.map((vitamin, index) => (
                      <div key={index} className="flex items-center gap-1 bg-green-50 border border-green-100 rounded-full px-3 py-1">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-700">{vitamin}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {micronutrients?.minerals && micronutrients.minerals.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Minerals</h3>
                  <div className="flex flex-wrap gap-2">
                    {micronutrients.minerals.map((mineral, index) => (
                      <div key={index} className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
                        <Check className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-blue-700">{mineral}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!micronutrients?.vitamins || micronutrients.vitamins.length === 0) && 
               (!micronutrients?.minerals || micronutrients.minerals.length === 0) && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>No detailed micronutrient data available</span>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-4 pt-4">
              {personalizedRecommendations && personalizedRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {personalizedRecommendations.map((recommendation, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start">
                      <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>No personalized recommendations available</span>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumNutriScore; 