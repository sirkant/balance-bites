
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UploadCloud, LogOut, PieChart, Eye, Calendar, Plus } from 'lucide-react';
import DailyNutrition from '@/components/DailyNutrition';

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
  };
  created_at: string;
}

const Dashboard = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary py-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold">NutriVision Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
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
          <TabsList>
            <TabsTrigger value="summary">
              <Calendar className="h-4 w-4 mr-2" />
              Daily Summary
            </TabsTrigger>
            <TabsTrigger value="meals">
              <PieChart className="h-4 w-4 mr-2" />
              My Meals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <DailyNutrition />
          </TabsContent>

          <TabsContent value="meals" className="space-y-6">
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
                {meals.map((meal) => (
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
