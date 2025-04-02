import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, Info, Leaf, Cookie, Apple, 
  BarChart, PieChart, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MacronutrientData {
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface VitaminData {
  vitamin_a?: number;
  vitamin_c?: number;
  vitamin_d?: number;
  vitamin_e?: number;
  vitamin_k?: number;
  thiamine?: number;
  riboflavin?: number;
  niacin?: number;
  b6?: number;
  b12?: number;
  folate?: number;
  [key: string]: number | undefined;
}

interface MineralData {
  calcium?: number;
  iron?: number;
  magnesium?: number;
  zinc?: number;
  potassium?: number;
  sodium?: number;
  selenium?: number;
  [key: string]: number | undefined;
}

interface MicronutrientData {
  vitamins: VitaminData;
  minerals: MineralData;
}

interface DietaryInfo {
  isGlutenFree?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isDairyFree?: boolean;
  isLowCarb?: boolean;
  [key: string]: boolean | undefined;
}

interface Evaluation {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface MealAnalysisData {
  foods: string[];
  calories: number;
  macronutrients?: MacronutrientData;
  macros?: {
    proteins?: string | number;
    protein?: string | number;
    carbohydrates?: string | number;
    carbs?: string | number;
    fats?: string | number;
    fat?: string | number;
    fiber?: string | number;
  };
  micronutrients?: MicronutrientData;
  dietaryInfo?: DietaryInfo;
  evaluation?: Evaluation;
  nutritionScore?: number;
  healthInsights?: string[];
  improvementSuggestions?: string[];
  nutritionalAnalysis?: string;
  confidence: 'high' | 'medium' | 'low';
}

interface AnalysisProps {
  mealAnalysis: MealAnalysisData;
}

const NutrientMetric = ({ 
  name, 
  value, 
  goal, 
  unit, 
  icon 
}: { 
  name: string, 
  value: number, 
  goal: number, 
  unit: string, 
  icon?: React.ReactNode 
}) => {
  const percentage = Math.min(Math.round((value / goal) * 100), 100);
  
  let statusColor = 'bg-yellow-500';
  let statusText = 'Moderate';
  
  if (percentage >= 90) {
    statusColor = 'bg-green-500';
    statusText = 'Excellent';
  } else if (percentage < 40) {
    statusColor = 'bg-red-500';
    statusText = 'Low';
  }
  
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <h4 className="font-medium">{name}</h4>
        </div>
        <Badge variant="outline" className="font-mono">
          {value}{unit} / {goal}{unit}
        </Badge>
      </div>
      
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className={`${statusColor} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">{statusText}</span>
        <span className="text-xs font-semibold">{percentage}%</span>
      </div>
    </div>
  );
};

const formatNutrientName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const parseMacroValue = (value: string | number | undefined): number => {
  if (value === undefined) return 0;
  
  if (typeof value === 'number') return value;
  
  const numericPart = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
  return isNaN(numericPart) ? 0 : numericPart;
};

const Analysis = ({ mealAnalysis }: AnalysisProps) => {
  const [expandedSections, setExpandedSections] = useState({
    vitamins: false,
    minerals: false
  });
  
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fiber = 0;

  if (mealAnalysis.macronutrients) {
    protein = mealAnalysis.macronutrients.protein;
    carbs = mealAnalysis.macronutrients.carbs;
    fat = mealAnalysis.macronutrients.fat;
    fiber = mealAnalysis.macronutrients.fiber || 0;
  } 
  else if (mealAnalysis.macros) {
    protein = parseMacroValue(mealAnalysis.macros.proteins || mealAnalysis.macros.protein);
    carbs = parseMacroValue(mealAnalysis.macros.carbohydrates || mealAnalysis.macros.carbs);
    fat = parseMacroValue(mealAnalysis.macros.fats || mealAnalysis.macros.fat);
    fiber = parseMacroValue(mealAnalysis.macros.fiber);
  }
  
  const macroData = [
    { name: 'Protein', value: protein, goal: 50, unit: 'g' },
    { name: 'Carbs', value: carbs, goal: 300, unit: 'g' },
    { name: 'Fat', value: fat, goal: 70, unit: 'g' },
  ];
  
  if (fiber > 0) {
    macroData.push({ name: 'Fiber', value: fiber, goal: 25, unit: 'g' });
  }
  
  const pieData = [
    { name: 'Protein', value: protein, color: '#4f46e5' },
    { name: 'Carbs', value: carbs, color: '#06b6d4' },
    { name: 'Fat', value: fat, color: '#f59e0b' },
  ];
  
  if (fiber > 0) {
    pieData.push({ name: 'Fiber', value: fiber, color: '#10b981' });
  }
  
  const vitaminsData = mealAnalysis.micronutrients?.vitamins ? 
    Object.entries(mealAnalysis.micronutrients.vitamins).map(([key, value]) => ({
      name: formatNutrientName(key),
      value: value || 0,
      goal: 100,
      unit: '%'
    })) : [];
  
  const mineralsData = mealAnalysis.micronutrients?.minerals ? 
    Object.entries(mealAnalysis.micronutrients.minerals).map(([key, value]) => ({
      name: formatNutrientName(key),
      value: value || 0,
      goal: 100,
      unit: '%'
    })) : [];
  
  const toggleSection = (section: 'vitamins' | 'minerals') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const strengths = mealAnalysis.evaluation?.strengths || 
                    (mealAnalysis.healthInsights ? [...mealAnalysis.healthInsights] : []);
  
  const weaknesses = mealAnalysis.evaluation?.weaknesses || [];
  
  const suggestions = mealAnalysis.evaluation?.suggestions || 
                     (mealAnalysis.improvementSuggestions ? [...mealAnalysis.improvementSuggestions] : []);

  const getNutritionGrade = () => {
    if (mealAnalysis.nutritionScore !== undefined) {
      const score = mealAnalysis.nutritionScore;
      if (score >= 80) return { grade: 'A', color: 'bg-green-500', text: 'Excellent' };
      if (score >= 60) return { grade: 'B', color: 'bg-green-500', text: 'Good' };
      if (score >= 40) return { grade: 'C', color: 'bg-yellow-500', text: 'Average' };
      if (score >= 20) return { grade: 'D', color: 'bg-orange-500', text: 'Below Average' };
      return { grade: 'F', color: 'bg-red-500', text: 'Poor' };
    }
    
    if (protein > 0 || carbs > 0 || fat > 0) {
      const proteinCal = protein * 4;
      const carbsCal = carbs * 4;
      const fatCal = fat * 9;
      const totalCal = mealAnalysis.calories;
      
      const proteinRatio = proteinCal / totalCal;
      const carbsRatio = carbsCal / totalCal;
      const fatRatio = fatCal / totalCal;
      
      const isBalanced = 
        proteinRatio >= 0.2 && proteinRatio <= 0.35 &&
        carbsRatio >= 0.35 && carbsRatio <= 0.55 && 
        fatRatio >= 0.2 && fatRatio <= 0.35;
        
      if (isBalanced) return { grade: 'B', color: 'bg-green-500', text: 'Good' };
      return { grade: 'C', color: 'bg-yellow-500', text: 'Average' };
    }
    
    return { grade: 'C', color: 'bg-yellow-500', text: 'Average' };
  };
  
  const nutritionGrade = getNutritionGrade();
  
  const caloriesValue = typeof mealAnalysis.calories === 'string' 
    ? parseInt(mealAnalysis.calories.replace(/[^0-9]/g, '')) 
    : mealAnalysis.calories;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 animate-scale-in">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 pb-6 border-b">
        <div>
          <div className="flex items-center mb-2">
            <Badge className={`mr-2 ${nutritionGrade.color} hover:${nutritionGrade.color}`}>
              {nutritionGrade.text}
            </Badge>
            <h2 className="text-2xl font-bold">Nutritional Analysis</h2>
          </div>
          <p className="text-muted-foreground">
            Detailed breakdown of your meal's nutritional content
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + 
              encodeURIComponent(JSON.stringify(mealAnalysis, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "meal-analysis.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
      
      {(mealAnalysis.evaluation?.suggestions?.length > 0 || mealAnalysis.nutritionalAnalysis) && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium mb-1">Analysis Summary</h4>
            <p className="text-sm text-muted-foreground">
              {mealAnalysis.evaluation?.suggestions?.[0] || mealAnalysis.nutritionalAnalysis}
            </p>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="macros">Macronutrients</TabsTrigger>
          <TabsTrigger value="vitamins">Vitamins & Minerals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border p-4 shadow-sm text-center">
              <h3 className="text-lg font-medium mb-1">Total Calories</h3>
              <div className="text-3xl font-bold mb-2">{caloriesValue}</div>
              <p className="text-sm text-muted-foreground">
                {caloriesValue < 300 ? 'Light meal' : 
                 caloriesValue < 600 ? 'Balanced meal' : 'Heavy meal'}
              </p>
            </div>
            
            <div className="bg-white rounded-lg border p-4 shadow-sm text-center">
              <h3 className="text-lg font-medium mb-1">Nutrient Score</h3>
              <div className={`text-3xl font-bold ${nutritionGrade.color === 'bg-green-500' ? 'text-green-500' : 
                                                     nutritionGrade.color === 'bg-yellow-500' ? 'text-yellow-500' :
                                                     nutritionGrade.color === 'bg-orange-500' ? 'text-orange-500' :
                                                     'text-red-500'} mb-2`}>
                {nutritionGrade.grade}
              </div>
              <p className="text-sm text-muted-foreground">{nutritionGrade.text}</p>
            </div>
            
            <div className="bg-white rounded-lg border p-4 shadow-sm text-center">
              <h3 className="text-lg font-medium mb-1">Food Groups</h3>
              <div className="text-3xl font-bold mb-2">{mealAnalysis.foods.length}/5</div>
              <p className="text-sm text-muted-foreground">
                {mealAnalysis.foods.length >= 4 ? 'Good diversity' : 
                 mealAnalysis.foods.length >= 2 ? 'Average diversity' : 'Limited diversity'}
              </p>
            </div>
          </div>
          
          {(protein > 0 || carbs > 0 || fat > 0) && (
            <>
              <h3 className="text-xl font-semibold mb-4">Macronutrient Distribution</h3>
              <div className="h-[300px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value}g`, 'Amount']} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-green-500" />
                Detected Food Items
              </h3>
              <ul className="space-y-2">
                {mealAnalysis.foods.map((food, index) => (
                  <li key={index} className="flex items-center bg-secondary/50 p-2 rounded">
                    <div className={`w-2 h-2 ${
                      ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500']
                      [index % 5]
                    } rounded-full mr-2`}></div>
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {mealAnalysis.dietaryInfo && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Cookie className="mr-2 h-5 w-5 text-orange-500" />
                  Dietary Information
                </h3>
                <ul className="space-y-2">
                  {Object.entries(mealAnalysis.dietaryInfo).map(([key, value]) => (
                    <li key={key} className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                      <span>{formatNutrientName(key.replace('is', ''))}</span>
                      <Badge variant="secondary">{value ? 'Yes' : 'No'}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="macros">
          {macroData.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {macroData.map((item) => (
                  <NutrientMetric
                    key={item.name}
                    name={item.name}
                    value={item.value}
                    goal={item.goal}
                    unit={item.unit}
                  />
                ))}
              </div>
              
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-primary" />
                Macronutrients Progress
              </h3>
              
              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={macroData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value, name, props) => {
                        if (name === 'value') return [`${value}${props.payload.unit}`, 'Current'];
                        if (name === 'goal') return [`${value}${props.payload.unit}`, 'Target'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      name="Current" 
                      dataKey="value" 
                      fill="#4f46e5" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      name="Target" 
                      dataKey="goal" 
                      fill="#94a3b8" 
                      radius={[4, 4, 0, 0]} 
                      opacity={0.4} 
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          
          {weaknesses.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Recommendation</h4>
                <p className="text-sm text-muted-foreground">
                  {weaknesses[0]}
                </p>
              </div>
            </div>
          )}
          
          {macroData.length === 0 && (
            <div className="text-center py-12 bg-secondary/20 rounded-lg">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Macronutrient Data Available</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Detailed macronutrient information could not be determined for this meal.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="vitamins">
          {vitaminsData.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <Apple className="mr-2 h-5 w-5 text-green-500" />
                  Vitamins
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSection('vitamins')}
                >
                  {expandedSections.vitamins ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {(expandedSections.vitamins ? vitaminsData : vitaminsData.slice(0, 4)).map((item) => (
                  <NutrientMetric
                    key={item.name}
                    name={item.name}
                    value={item.value}
                    goal={item.goal}
                    unit={item.unit}
                  />
                ))}
              </div>
              
              {!expandedSections.vitamins && vitaminsData.length > 4 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleSection('vitamins')}
                  className="mb-6"
                >
                  Show All Vitamins
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          {mineralsData.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-blue-500" />
                  Minerals
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSection('minerals')}
                >
                  {expandedSections.minerals ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(expandedSections.minerals ? mineralsData : mineralsData.slice(0, 4)).map((item) => (
                  <NutrientMetric
                    key={item.name}
                    name={item.name}
                    value={item.value}
                    goal={item.goal}
                    unit={item.unit}
                  />
                ))}
              </div>
              
              {!expandedSections.minerals && mineralsData.length > 4 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleSection('minerals')}
                  className="mt-4"
                >
                  Show All Minerals
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          {vitaminsData.length === 0 && mineralsData.length === 0 && (
            <div className="text-center py-12 bg-secondary/20 rounded-lg">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Micronutrient Data Available</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Detailed micronutrient information could not be determined for this meal.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="space-y-6">
            {strengths.length > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Strengths
                </h3>
                <ul className="space-y-2 pl-5">
                  {strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-muted-foreground list-disc">
                      <span className="font-medium text-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {weaknesses.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  Improvement Areas
                </h3>
                <ul className="space-y-2 pl-5">
                  {weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-muted-foreground list-disc">
                      <span className="font-medium text-foreground">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {suggestions.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Suggestions for Next Meal
                </h3>
                <ul className="space-y-2 pl-5">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground list-disc">
                      <span className="font-medium text-foreground">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {strengths.length === 0 && weaknesses.length === 0 && suggestions.length === 0 && (
              <div className="text-center py-12 bg-secondary/20 rounded-lg">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Detailed Insights Available</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Detailed nutritional insights could not be generated for this meal.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;
