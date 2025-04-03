import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface Meal {
  id: string;
  meal_name: string;
  meal_time: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
}

interface NutritionalRecommendations {
  daily_calories: number;
  daily_protein: number;
  daily_carbohydrates: number;
  daily_fats: number;
  daily_fiber: number;
  daily_sugar: number;
  daily_sodium: number;
  daily_cholesterol: number;
}

const NutritionalDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recommendations, setRecommendations] = useState<NutritionalRecommendations | null>(null);

  // Fetch user's nutritional recommendations
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('age_range, gender, activity_level')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('No profile found');

      const { data: recommendations } = await supabase
        .from('nutritional_recommendations')
        .select('*')
        .eq('age_range', profile.age_range)
        .eq('gender', profile.gender)
        .eq('activity_level', profile.activity_level)
        .single();

      return recommendations;
    },
    onSuccess: (data) => {
      if (data) {
        setRecommendations(data);
      }
    }
  });

  // Fetch meals for the selected date
  const { data: meals, isLoading } = useQuery({
    queryKey: ['meals', selectedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: meals } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('meal_time', startOfDay(selectedDate).toISOString())
        .lte('meal_time', endOfDay(selectedDate).toISOString())
        .order('meal_time', { ascending: true });

      return meals as Meal[];
    }
  });

  // Calculate daily totals
  const dailyTotals: DailyTotals = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
  };

  meals?.forEach(meal => {
    dailyTotals.calories += meal.calories || 0;
    dailyTotals.protein += meal.protein || 0;
    dailyTotals.carbohydrates += meal.carbohydrates || 0;
    dailyTotals.fats += meal.fats || 0;
    dailyTotals.fiber += meal.fiber || 0;
    dailyTotals.sugar += meal.sugar || 0;
    dailyTotals.sodium += meal.sodium || 0;
    dailyTotals.cholesterol += meal.cholesterol || 0;
  });

  const calculateProgress = (value: number, recommended: number) => {
    return Math.min((value / recommended) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Daily Overview</TabsTrigger>
          <TabsTrigger value="meals">Per-Meal View</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Nutritional Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recommendations && (
                  <>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Calories</span>
                        <span>{dailyTotals.calories} / {recommendations.daily_calories}</span>
                      </div>
                      <Progress value={calculateProgress(dailyTotals.calories, recommendations.daily_calories)} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Protein (g)</span>
                        <span>{dailyTotals.protein.toFixed(1)} / {recommendations.daily_protein}</span>
                      </div>
                      <Progress value={calculateProgress(dailyTotals.protein, recommendations.daily_protein)} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Carbohydrates (g)</span>
                        <span>{dailyTotals.carbohydrates.toFixed(1)} / {recommendations.daily_carbohydrates}</span>
                      </div>
                      <Progress value={calculateProgress(dailyTotals.carbohydrates, recommendations.daily_carbohydrates)} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Fats (g)</span>
                        <span>{dailyTotals.fats.toFixed(1)} / {recommendations.daily_fats}</span>
                      </div>
                      <Progress value={calculateProgress(dailyTotals.fats, recommendations.daily_fats)} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Fiber (g)</span>
                        <span>{dailyTotals.fiber.toFixed(1)} / {recommendations.daily_fiber}</span>
                      </div>
                      <Progress value={calculateProgress(dailyTotals.fiber, recommendations.daily_fiber)} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Sugar (g)</span>
                        <span>{dailyTotals.sugar.toFixed(1)} / {recommendations.daily_sugar}</span>
                      </div>
                      <Progress value={calculateProgress(dailyTotals.sugar, recommendations.daily_sugar)} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Sodium (mg)</span>
                        <span>{dailyTotals.sodium.toFixed(1)} / {recommendations.daily_sodium}</span>
                      </div>
                      <Progress value={calculateProgress(dailyTotals.sodium, recommendations.daily_sodium)} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Cholesterol (mg)</span>
                        <span>{dailyTotals.cholesterol.toFixed(1)} / {recommendations.daily_cholesterol}</span>
                      </div>
                      <Progress value={calculateProgress(dailyTotals.cholesterol, recommendations.daily_cholesterol)} />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {meals?.map((meal) => (
                <Card key={meal.id}>
                  <CardHeader>
                    <CardTitle>{meal.meal_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Calories</div>
                        <div className="text-2xl font-bold">{meal.calories || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Protein</div>
                        <div className="text-2xl font-bold">{meal.protein?.toFixed(1) || 0}g</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Carbohydrates</div>
                        <div className="text-2xl font-bold">{meal.carbohydrates?.toFixed(1) || 0}g</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Fats</div>
                        <div className="text-2xl font-bold">{meal.fats?.toFixed(1) || 0}g</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Fiber</div>
                        <div className="text-2xl font-bold">{meal.fiber?.toFixed(1) || 0}g</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Sugar</div>
                        <div className="text-2xl font-bold">{meal.sugar?.toFixed(1) || 0}g</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Sodium</div>
                        <div className="text-2xl font-bold">{meal.sodium?.toFixed(1) || 0}mg</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Cholesterol</div>
                        <div className="text-2xl font-bold">{meal.cholesterol?.toFixed(1) || 0}mg</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NutritionalDashboard; 