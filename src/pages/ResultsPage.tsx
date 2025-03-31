
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Analysis from '@/components/Analysis';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Clock, ArrowLeft, Share2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LocationState {
  mealData?: any;
}

const ResultsPage = () => {
  const [meal, setMeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to view meal analysis results."
        });
        navigate('/auth', { replace: true });
        return;
      }
      
      // Check if meal data was passed via navigation state
      if (state?.mealData) {
        setMeal(state.mealData);
        setLoading(false);
      } else {
        // If no meal data was passed, redirect to upload page
        toast({
          variant: "destructive",
          title: "No meal data found",
          description: "Please upload a meal image for analysis."
        });
        navigate('/upload', { replace: true });
      }
    };

    checkAuth();
  }, [navigate, state, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-20 pb-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between mb-8">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-64" />
              </div>
              <div className="flex space-x-3">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Skeleton className="h-96 w-full rounded-lg" />
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!meal || !meal.analysis) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-20 pb-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center text-center p-8">
              <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Analysis Data Not Available</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find the analysis data for this meal. This could be due to an error during processing.
              </p>
              <Button asChild>
                <Link to="/upload">Try Again with New Image</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-fade-in">
            <div>
              <Link 
                to="/upload"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2 transition-colors"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Upload
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Your Meal Analysis</h1>
            </div>
            
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Button variant="outline" size="sm" asChild>
                <Link to="/upload">
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Another
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                toast({
                  title: "Sharing not yet implemented",
                  description: "Sharing functionality will be available in a future update."
                });
              }}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24 animate-scale-in">
                <h2 className="text-xl font-semibold mb-4">Meal Details</h2>
                
                <div className="relative mb-6">
                  <img 
                    src={meal.image_url} 
                    alt="Analyzed meal" 
                    className="w-full h-auto rounded-lg object-cover" 
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(meal.created_at)}
                  </div>
                </div>
                
                <h3 className="font-medium mb-2">Detected Items</h3>
                <ul className="space-y-2 mb-6">
                  {meal.analysis.foods.map((food: string, index: number) => (
                    <li key={index} className="flex justify-between text-sm bg-secondary/50 p-2 rounded">
                      <span>{food}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-xl font-bold">{meal.analysis.calories}</p>
                  </div>
                  {meal.analysis.nutritionScore !== undefined && (
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-xl font-bold text-green-500">
                        {meal.analysis.nutritionScore > 80 ? 'A' : 
                         meal.analysis.nutritionScore > 60 ? 'B' : 
                         meal.analysis.nutritionScore > 40 ? 'C' : 
                         meal.analysis.nutritionScore > 20 ? 'D' : 'F'}
                      </p>
                    </div>
                  )}
                </div>
                
                <Button className="w-full" onClick={() => {
                  toast({
                    title: "Saved to Dashboard",
                    description: "This meal has already been saved to your dashboard."
                  });
                  navigate('/dashboard');
                }}>
                  View in Dashboard
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Analysis mealAnalysis={meal.analysis} />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResultsPage;
