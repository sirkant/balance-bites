
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
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Placeholder data for charts
const macroData = [
  { name: 'Protein', value: 25, goal: 30, unit: 'g' },
  { name: 'Carbs', value: 45, goal: 55, unit: 'g' },
  { name: 'Fat', value: 15, goal: 25, unit: 'g' },
  { name: 'Fiber', value: 8, goal: 12, unit: 'g' },
];

const pieData = [
  { name: 'Protein', value: 25, color: '#4f46e5' },
  { name: 'Carbs', value: 45, color: '#06b6d4' },
  { name: 'Fat', value: 15, color: '#f59e0b' },
  { name: 'Fiber', value: 8, color: '#10b981' },
];

const vitaminsData = [
  { name: 'Vitamin A', value: 75, goal: 100, unit: '%' },
  { name: 'Vitamin C', value: 120, goal: 100, unit: '%' },
  { name: 'Vitamin D', value: 30, goal: 100, unit: '%' },
  { name: 'Vitamin E', value: 50, goal: 100, unit: '%' },
  { name: 'Vitamin K', value: 65, goal: 100, unit: '%' },
  { name: 'Vitamin B6', value: 85, goal: 100, unit: '%' },
  { name: 'Vitamin B12', value: 70, goal: 100, unit: '%' },
];

const mineralsData = [
  { name: 'Calcium', value: 35, goal: 100, unit: '%' },
  { name: 'Iron', value: 60, goal: 100, unit: '%' },
  { name: 'Magnesium', value: 45, goal: 100, unit: '%' },
  { name: 'Zinc', value: 80, goal: 100, unit: '%' },
  { name: 'Potassium', value: 30, goal: 100, unit: '%' },
];

// Component to display a metric with visual indicator
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

const Analysis = () => {
  const [expandedSections, setExpandedSections] = useState({
    vitamins: false,
    minerals: false
  });
  
  const toggleSection = (section: 'vitamins' | 'minerals') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 animate-scale-in">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 pb-6 border-b">
        <div>
          <div className="flex items-center mb-2">
            <Badge className="mr-2 bg-green-500 hover:bg-green-600">Good</Badge>
            <h2 className="text-2xl font-bold">Nutritional Analysis</h2>
          </div>
          <p className="text-muted-foreground">
            Detailed breakdown of your meal's nutritional content
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button size="sm">Save to History</Button>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium mb-1">Analysis Summary</h4>
          <p className="text-sm text-muted-foreground">
            This meal is well balanced in protein and vitamins, but low in essential minerals. 
            Consider adding more leafy greens or nuts to improve mineral content.
          </p>
        </div>
      </div>
      
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
              <div className="text-3xl font-bold mb-2">475</div>
              <p className="text-sm text-muted-foreground">Balanced meal</p>
            </div>
            
            <div className="bg-white rounded-lg border p-4 shadow-sm text-center">
              <h3 className="text-lg font-medium mb-1">Nutrient Score</h3>
              <div className="text-3xl font-bold text-green-500 mb-2">B+</div>
              <p className="text-sm text-muted-foreground">Above average</p>
            </div>
            
            <div className="bg-white rounded-lg border p-4 shadow-sm text-center">
              <h3 className="text-lg font-medium mb-1">Food Groups</h3>
              <div className="text-3xl font-bold mb-2">4/5</div>
              <p className="text-sm text-muted-foreground">Good diversity</p>
            </div>
          </div>
          
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
                <Tooltip formatter={(value) => [`${value}g`, 'Amount']} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-green-500" />
                Detected Food Items
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center bg-secondary/50 p-2 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Grilled Chicken Breast (120g)</span>
                </li>
                <li className="flex items-center bg-secondary/50 p-2 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Brown Rice (1 cup)</span>
                </li>
                <li className="flex items-center bg-secondary/50 p-2 rounded">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span>Steamed Broccoli (80g)</span>
                </li>
                <li className="flex items-center bg-secondary/50 p-2 rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Olive Oil (1 tbsp)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Cookie className="mr-2 h-5 w-5 text-orange-500" />
                Dietary Information
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                  <span>Gluten-Free</span>
                  <Badge variant="secondary">Yes</Badge>
                </li>
                <li className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                  <span>Vegetarian</span>
                  <Badge variant="secondary">No</Badge>
                </li>
                <li className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                  <span>Dairy-Free</span>
                  <Badge variant="secondary">Yes</Badge>
                </li>
                <li className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                  <span>Low-Carb</span>
                  <Badge variant="secondary">Moderate</Badge>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="macros">
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
                <Tooltip 
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
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Recommendation</h4>
              <p className="text-sm text-muted-foreground">
                Your meal is slightly low in fiber. Consider adding a side of beans, lentils, 
                or additional vegetables to increase your fiber intake.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="vitamins">
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
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Strengths
              </h3>
              <ul className="space-y-2 pl-5">
                <li className="text-sm text-muted-foreground list-disc">
                  <span className="font-medium text-foreground">Excellent protein content</span> - 
                  The grilled chicken provides high-quality protein, supporting muscle maintenance and repair.
                </li>
                <li className="text-sm text-muted-foreground list-disc">
                  <span className="font-medium text-foreground">Good vitamin C levels</span> - 
                  The broccoli provides over 100% of your recommended daily vitamin C intake.
                </li>
                <li className="text-sm text-muted-foreground list-disc">
                  <span className="font-medium text-foreground">Healthy fats</span> - 
                  The olive oil provides heart-healthy monounsaturated fats.
                </li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                Improvement Areas
              </h3>
              <ul className="space-y-2 pl-5">
                <li className="text-sm text-muted-foreground list-disc">
                  <span className="font-medium text-foreground">Low in calcium</span> - 
                  Consider adding dairy or calcium-fortified foods to increase calcium intake.
                </li>
                <li className="text-sm text-muted-foreground list-disc">
                  <span className="font-medium text-foreground">Limited vitamin D</span> - 
                  This meal provides only 30% of your daily vitamin D needs. Consider adding fatty fish or 
                  vitamin D-fortified foods.
                </li>
                <li className="text-sm text-muted-foreground list-disc">
                  <span className="font-medium text-foreground">More fiber needed</span> - 
                  Adding more vegetables or switching to higher fiber grains could improve your fiber intake.
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Suggestions for Next Meal
              </h3>
              <ul className="space-y-2 pl-5">
                <li className="text-sm text-muted-foreground list-disc">
                  <span className="font-medium text-foreground">Add leafy greens</span> - 
                  Spinach or kale would provide more iron, calcium, and additional vitamins.
                </li>
                <li className="text-sm text-muted-foreground list-disc">
                  <span className="font-medium text-foreground">Include nuts or seeds</span> - 
                  Adding almonds or chia seeds would increase healthy fats and minerals.
                </li>
                <li className="text-sm text-muted-foreground list-disc">
                  <span className="font-medium text-foreground">Consider whole grains</span> - 
                  Quinoa or barley would provide more fiber and a different nutrient profile than rice.
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;
