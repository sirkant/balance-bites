
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Camera, Clock, Calendar, Info } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LoadingAnimation from '@/components/LoadingAnimation';

const mealFormSchema = z.object({
  mealName: z.string().min(1, { message: 'Meal name is required' }),
  description: z.string().optional(),
  mealTime: z.string().default(() => format(new Date(), "yyyy-MM-dd'T'HH:mm")),
  image: z.any(),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

const MealUploadForm = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      mealName: '',
      description: '',
      mealTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MealFormValues) => {
    if (!preview) {
      toast({
        title: "Image required",
        description: "Please upload an image of your meal",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('You need to be logged in');
      }
      
      // Use string interpolation to get the Supabase URL safely
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/meals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            imageBase64: preview,
            mealName: data.mealName,
            description: data.description || '',
            mealTime: data.mealTime,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload meal');
      }

      const mealData = await response.json();

      toast({
        title: "Success!",
        description: "Your meal has been uploaded and analyzed.",
      });

      navigate('/results', { 
        state: { 
          mealData: mealData,
          mealId: mealData.id
        } 
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Something went wrong with the upload",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-semibold mb-6">Upload Your Meal</h2>
      
      {isUploading ? (
        <div className="text-center py-12">
          <LoadingAnimation />
          <p className="mt-4 text-muted-foreground">Processing your meal data...</p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="mealName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Breakfast, Lunch, Dinner, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your meal..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mealTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Time</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input type="datetime-local" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-3">
              <FormLabel>Meal Photo</FormLabel>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 transition-all ${
                  preview ? 'border-green-400 bg-green-50/30' : 'border-border bg-secondary/50'
                }`}
              >
                {!preview ? (
                  <div className="text-center py-8">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Upload your meal photo</h3>
                    <p className="text-muted-foreground mb-6">
                      Take a photo of your meal for nutritional analysis
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => document.getElementById('meal-image')?.click()}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <Input
                      id="meal-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <img 
                      src={preview} 
                      alt="Meal preview" 
                      className="max-h-[300px] rounded-lg mx-auto object-contain" 
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      className="mt-4"
                      onClick={() => setPreview(null)}
                    >
                      Change Image
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Tips for best results:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Take the photo from directly above the meal</li>
                  <li>• Ensure good lighting to capture food details clearly</li>
                  <li>• Include all items on the plate in your photo</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4">
              <Button type="submit" className="w-full">
                Upload & Analyze
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default MealUploadForm;
