import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UploadCloud, LogOut } from 'lucide-react';

interface Meal {
  id: string;
  image_url: string;
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
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
        const response = await fetch(
          `${supabaseUrl}/functions/v1/meals`,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an image to upload',
      });
      return;
    }

    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('You need to be logged in');
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        // Call our Supabase Edge Function
        const response = await fetch(
          `${supabaseUrl}/functions/v1/meals`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              imageBase64: base64Image,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload meal');
        }

        toast({
          title: 'Success!',
          description: 'Your meal has been uploaded and analyzed.',
        });

        // Reset file input
        setSelectedFile(null);
        const fileInput = document.getElementById('meal-image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        // Refresh meals list
        fetchMeals();
      };

      reader.onerror = (error) => {
        throw new Error('Failed to read file');
      };
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Something went wrong',
      });
    } finally {
      setUploading(false);
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
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Meal</CardTitle>
              <CardDescription>
                Upload a photo of your meal for nutritional analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input
                    id="meal-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload & Analyze
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Meal History</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading your meals...</div>
          ) : meals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You haven't uploaded any meals yet. Upload your first meal to see the analysis!
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
                      {meal.analysis?.foods?.length > 0 
                        ? meal.analysis.foods.map(food => 
                            food.charAt(0).toUpperCase() + food.slice(1)
                          ).join(', ')
                        : 'Meal Analysis'
                      }
                    </CardTitle>
                    <CardDescription>
                      {formatDate(meal.created_at)}
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
