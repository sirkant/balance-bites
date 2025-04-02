
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MealUploadForm from '@/components/MealUploadForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload } from 'lucide-react';

const MealUploadPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to upload meal data."
        });
        navigate('/auth', { replace: true });
        return;
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-20 pb-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading...</div>
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
          <div className="mb-6 flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/upload')}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" /> Simple Upload
            </Button>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <MealUploadForm />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MealUploadPage;
