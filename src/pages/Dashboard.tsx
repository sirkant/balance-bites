import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  UploadCloud, 
  LogOut, 
  PieChart, 
  Eye, 
  Calendar, 
  Plus, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Droplet,
  Activity,
  Apple,
  Heart,
  Brain
} from 'lucide-react';
import DailyNutrition from '@/components/DailyNutrition';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer } from '@/components/ui/chart';
import { 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Line, 
  Bar, 
  AreaChart, 
  Area, 
  BarChart, 
  LineChart, 
  Legend,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface Meal {
  id: string;
  image_url: string;
  meal_name: string | null;
  description: string | null;
  meal_time: string | null;
  analysis: {
    calories: number;
    macronutrients: {
      protein: number;
      carbs: number;
      fat: number;
    };
    foods: string[];
    micronutrients?: {
      fiber: number;
      sugar: number;
      sodium: number;
      vitamins: string[];
      minerals: string[];
    };
    nutritionScore?: number;
    healthScore?: number;
    recommendations?: string[];
  };
  created_at: string;
}

interface NutritionGoals {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

interface NutrientTrend {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface MacroDistribution {
  name: string;
  value: number;
  color: string;
}

const Dashboard = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<NutritionGoals>({
    dailyCalories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
    fiber: 25,
    water: 2000
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [nutrientTrends, setNutrientTrends] = useState<NutrientTrend[]>([]);
  const [macroDistribution, setMacroDistribution] = useState<MacroDistribution[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/auth');
      } else {
        fetchMeals();
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (meals.length > 0) {
      generateTrendData();
      generateMacroDistribution();
    }
  }, [meals, timeRange]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        // Use the SUPABASE_URL from the client
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meals`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch meals');
        }
        
        const mealsData = await response.json();
        setMeals(mealsData || []);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load meals',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const viewMealDetails = (meal: Meal) => {
    navigate('/results', { state: { mealData: meal } });
  };

  const calculateDailyTotals = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter(meal => 
      new Date(meal.created_at).toISOString().split('T')[0] === today
    );

    return todayMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.analysis?.calories || 0),
      protein: acc.protein + (meal.analysis?.macronutrients?.protein || 0),
      carbs: acc.carbs + (meal.analysis?.macronutrients?.carbs || 0),
      fat: acc.fat + (meal.analysis?.macronutrients?.fat || 0),
      fiber: acc.fiber + (meal.analysis?.micronutrients?.fiber || 0),
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    });
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getNutritionInsights = () => {
    const dailyTotals = calculateDailyTotals();
    const insights = [];

    if (dailyTotals.protein < goals.protein * 0.8) {
      insights.push('Consider adding more protein-rich foods to meet your daily goal');
    }
    if (dailyTotals.fiber < goals.fiber * 0.8) {
      insights.push('Increase fiber intake with more vegetables and whole grains');
    }
    if (dailyTotals.calories > goals.dailyCalories * 1.1) {
      insights.push('You\'ve exceeded your daily calorie goal');
    }

    return insights;
  };

  const generateTrendData = () => {
    // Group meals by date and calculate daily totals
    const mealsByDate = meals.reduce((acc, meal) => {
      const date = new Date(meal.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(meal);
      return acc;
    }, {} as Record<string, Meal[]>);

    // Define date range based on selected time range
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }

    // Generate dates in range
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create trend data with totals for each date
    const trends = dates.map(date => {
      const dayMeals = mealsByDate[date] || [];
      const dayTotals = dayMeals.reduce((acc, meal) => ({
        calories: acc.calories + (meal.analysis?.calories || 0),
        protein: acc.protein + (meal.analysis?.macronutrients?.protein || 0),
        carbs: acc.carbs + (meal.analysis?.macronutrients?.carbs || 0),
        fat: acc.fat + (meal.analysis?.macronutrients?.fat || 0),
        fiber: acc.fiber + (meal.analysis?.micronutrients?.fiber || 0)
      }), {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      });

      return {
        date: formatDateShort(date),
        ...dayTotals,
        target: goals.dailyCalories
      };
    });

    setNutrientTrends(trends);
  };

  const generateMacroDistribution = () => {
    const totals = calculateTotalNutrients();
    
    const distribution: MacroDistribution[] = [
      { name: 'Protein', value: totals.protein, color: '#10b981' },
      { name: 'Carbs', value: totals.carbs, color: '#3b82f6' },
      { name: 'Fat', value: totals.fat, color: '#f59e0b' }
    ];
    
    setMacroDistribution(distribution);
  };

  const calculateTotalNutrients = () => {
    // Filter meals based on selected time range
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }

    const filteredMeals = meals.filter(meal => {
      const mealDate = new Date(meal.created_at);
      return mealDate >= startDate && mealDate <= endDate;
    });

    return filteredMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.analysis?.calories || 0),
      protein: acc.protein + (meal.analysis?.macronutrients?.protein || 0),
      carbs: acc.carbs + (meal.analysis?.macronutrients?.carbs || 0),
      fat: acc.fat + (meal.analysis?.macronutrients?.fat || 0),
      fiber: acc.fiber + (meal.analysis?.micronutrients?.fiber || 0)
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary py-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold">NutriVision Dashboard</h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500">
              Premium
            </Badge>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold">Your Nutrition</h2>
          <Button asChild>
            <Link to="/upload">
              <Plus className="mr-2 h-4 w-4" />
              Add New Meal
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger value="summary">
              <Calendar className="h-4 w-4 mr-2" />
              Daily Summary
            </TabsTrigger>
            <TabsTrigger value="trends">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Lightbulb className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Apple className="h-5 w-5 mr-2" />
                    Calories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateDailyTotals().calories}
                    <span className="text-sm text-muted-foreground ml-1">/ {goals.dailyCalories} kcal</span>
                  </div>
                  <Progress 
                    value={calculateProgress(calculateDailyTotals().calories, goals.dailyCalories)} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Protein
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateDailyTotals().protein}
                    <span className="text-sm text-muted-foreground ml-1">/ {goals.protein}g</span>
                  </div>
                  <Progress 
                    value={calculateProgress(calculateDailyTotals().protein, goals.protein)} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Carbs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateDailyTotals().carbs}
                    <span className="text-sm text-muted-foreground ml-1">/ {goals.carbs}g</span>
                  </div>
                  <Progress 
                    value={calculateProgress(calculateDailyTotals().carbs, goals.carbs)} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Fat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateDailyTotals().fat}
                    <span className="text-sm text-muted-foreground ml-1">/ {goals.fat}g</span>
                  </div>
                  <Progress 
                    value={calculateProgress(calculateDailyTotals().fat, goals.fat)} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Water Intake</CardTitle>
                <CardDescription>Track your daily water consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Droplet className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <div className="text-2xl font-bold">
                      0 <span className="text-sm text-muted-foreground">/ {goals.water}ml</span>
                    </div>
                    <Progress value={0} className="mt-2" />
                  </div>
                  <Button variant="outline" size="sm">Add Water</Button>
                </div>
              </CardContent>
            </Card>

            <DailyNutrition />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Nutrition Trends</h3>
              <Select 
                value={timeRange} 
                onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calorie Intake</CardTitle>
                  <CardDescription>Daily calorie consumption over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={nutrientTrends}>
                      <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#f97316" 
                        fillOpacity={1} 
                        fill="url(#colorCalories)" 
                        name="Calories"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#94a3b8" 
                        strokeDasharray="5 5" 
                        name="Target"
                        // Using a function to return the constant goal value
                        // We need to add this to the data during preprocessing
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Macronutrient Distribution</CardTitle>
                  <CardDescription>Proportion of proteins, carbs, and fats</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={macroDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {macroDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Protein & Fiber</CardTitle>
                  <CardDescription>Daily intake of key nutrients</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={nutrientTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="protein" 
                        stroke="#10b981" 
                        activeDot={{ r: 8 }} 
                        name="Protein"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="fiber" 
                        stroke="#8b5cf6"
                        name="Fiber" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Macronutrient Trends</CardTitle>
                  <CardDescription>Protein, carbs, and fat over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={nutrientTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="protein" fill="#10b981" name="Protein" />
                      <Bar dataKey="carbs" fill="#3b82f6" name="Carbs" />
                      <Bar dataKey="fat" fill="#f59e0b" name="Fat" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Personalized recommendations based on your nutrition data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getNutritionInsights().map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Goals</CardTitle>
                <CardDescription>Set and track your nutritional targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Daily Calories</label>
                      <input
                        type="number"
                        value={goals.dailyCalories}
                        onChange={(e) => setGoals({ ...goals, dailyCalories: Number(e.target.value) })}
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Protein (g)</label>
                      <input
                        type="number"
                        value={goals.protein}
                        onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Carbs (g)</label>
                      <input
                        type="number"
                        value={goals.carbs}
                        onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Fat (g)</label>
                      <input
                        type="number"
                        value={goals.fat}
                        onChange={(e) => setGoals({ ...goals, fat: Number(e.target.value) })}
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Recent Meals</h3>
          {loading ? (
            <div className="text-center py-8">Loading your meals...</div>
          ) : meals.length === 0 ? (
            <div className="text-center py-12 bg-secondary/30 rounded-lg">
              <PieChart className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No meals recorded yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start tracking your nutrition by uploading your first meal photo for analysis.
              </p>
              <Button asChild>
                <Link to="/upload">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Your First Meal
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.slice(0, 6).map((meal) => (
                <Card key={meal.id} className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={meal.image_url} 
                      alt="Meal" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>
                      {meal.meal_name || (
                        meal.analysis?.foods?.length > 0 
                          ? meal.analysis.foods.map(food => 
                              food.charAt(0).toUpperCase() + food.slice(1)
                            ).join(', ')
                          : 'Meal Analysis'
                      )}
                    </CardTitle>
                    <CardDescription>
                      {meal.meal_time ? formatDate(meal.meal_time) : formatDate(meal.created_at)}
                      {meal.description && (
                        <p className="mt-1 text-sm">{meal.description}</p>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Calories:</span>
                        <span className="font-medium">{meal.analysis?.calories || 0} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein:</span>
                        <span className="font-medium">{meal.analysis?.macronutrients?.protein || 0}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbs:</span>
                        <span className="font-medium">{meal.analysis?.macronutrients?.carbs || 0}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fat:</span>
                        <span className="font-medium">{meal.analysis?.macronutrients?.fat || 0}g</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewMealDetails(meal)}
                      className="w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Detailed Analysis
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
