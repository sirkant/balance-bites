
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

type DailyNutritionData = {
  date: string;
  total_calories: number;
  total_proteins: number;
  total_carbs: number;
  total_fats: number;
  total_fiber: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DailyNutrition = () => {
  const [loading, setLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState<DailyNutritionData | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchDailyNutrition = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          return;
        }

        // Query the daily_nutrition table
        const { data, error } = await supabase
          .from('daily_nutrition')
          .select('*')
          .eq('date', today)
          .maybeSingle();

        if (error) {
          console.error('Error fetching daily nutrition:', error);
          return;
        }

        if (data) {
          setNutritionData(data as DailyNutritionData);
        } else {
          console.log('No nutrition data found for today');
          // Initialize with zeros if no data exists
          setNutritionData({
            date: today,
            total_calories: 0,
            total_proteins: 0,
            total_carbs: 0,
            total_fats: 0,
            total_fiber: 0
          });
        }
      } catch (error) {
        console.error('Error in fetchDailyNutrition:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyNutrition();
  }, [today]);

  // Calculate recommended daily intake percentages
  const getPercentages = () => {
    if (!nutritionData) return { calories: 0, proteins: 0, carbs: 0, fats: 0, fiber: 0 };

    // Standard daily recommended values (adjust as needed)
    const recommended = {
      calories: 2000, // calories
      proteins: 50,   // grams
      carbs: 275,     // grams
      fats: 78,       // grams
      fiber: 28       // grams
    };

    return {
      calories: Math.min(100, (nutritionData.total_calories / recommended.calories) * 100),
      proteins: Math.min(100, (nutritionData.total_proteins / recommended.proteins) * 100),
      carbs: Math.min(100, (nutritionData.total_carbs / recommended.carbs) * 100),
      fats: Math.min(100, (nutritionData.total_fats / recommended.fats) * 100),
      fiber: Math.min(100, (nutritionData.total_fiber / recommended.fiber) * 100)
    };
  };

  // Prepare data for pie chart
  const getPieData = () => {
    if (!nutritionData) return [];
    
    // Convert to pie chart format - calories from each macronutrient
    const proteinCalories = nutritionData.total_proteins * 4;
    const carbCalories = nutritionData.total_carbs * 4;
    const fatCalories = nutritionData.total_fats * 9;
    
    return [
      { name: 'Proteins', value: proteinCalories },
      { name: 'Carbs', value: carbCalories },
      { name: 'Fats', value: fatCalories }
    ];
  };
  
  const percentages = getPercentages();
  const pieData = getPieData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Nutrition</CardTitle>
          <CardDescription>Loading your daily nutrition summary...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nutritionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Nutrition</CardTitle>
          <CardDescription>No data available for today</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            Upload a meal to start tracking your daily nutrition
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Nutrition Summary</CardTitle>
        <CardDescription>
          {format(new Date(today), 'MMMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Calories */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-sm font-medium">{nutritionData.total_calories} / 2000 kcal</span>
              </div>
              <Progress value={percentages.calories} className="h-2" />
            </div>
            
            {/* Proteins */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Proteins</span>
                <span className="text-sm font-medium">{nutritionData.total_proteins}g / 50g</span>
              </div>
              <Progress value={percentages.proteins} className="h-2" />
            </div>
            
            {/* Carbohydrates */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Carbohydrates</span>
                <span className="text-sm font-medium">{nutritionData.total_carbs}g / 275g</span>
              </div>
              <Progress value={percentages.carbs} className="h-2" />
            </div>
            
            {/* Fats */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Fats</span>
                <span className="text-sm font-medium">{nutritionData.total_fats}g / 78g</span>
              </div>
              <Progress value={percentages.fats} className="h-2" />
            </div>
            
            {/* Fiber */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Fiber</span>
                <span className="text-sm font-medium">{nutritionData.total_fiber}g / 28g</span>
              </div>
              <Progress value={percentages.fiber} className="h-2" />
            </div>
          </div>
          
          <div className="text-center flex flex-col items-center justify-center">
            <h4 className="text-sm font-semibold mb-2">Calorie Distribution</h4>
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-1" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <span className="text-xs">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyNutrition;
