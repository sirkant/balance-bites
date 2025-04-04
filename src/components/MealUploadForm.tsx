import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Camera, Clock, Calendar, Info, Loader2, AlertTriangle } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { env } from '@/config/env';

const mealFormSchema = z.object({
  mealName: z.string().min(1, { message: 'Meal name is required' }),
  description: z.string().optional(),
  mealTime: z.string().default(() => format(new Date(), "yyyy-MM-dd'T'HH:mm")),
  image: z.any(),
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbohydrates: z.number().min(0).optional(),
  fats: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  cholesterol: z.number().min(0).optional(),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

const MealUploadForm = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  
  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      mealName: '',
      description: '',
      mealTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is HEIC/HEIF format (common for iPhone photos)
      const isHeicFormat = file.name.toLowerCase().endsWith('.heic') || 
                           file.name.toLowerCase().endsWith('.heif') || 
                           file.type === 'image/heic' || 
                           file.type === 'image/heif';
      
      if (isHeicFormat) {
        try {
          toast({
            title: "iPhone Photo Detected",
            description: "HEIC format detected. Attempting to process...",
            variant: "default"
          });
          
          try {
            const heic2any = await import('heic2any');
            
            // Try to convert HEIC to JPEG blob with timeout
            const jpegBlob = await Promise.race([
              heic2any.default({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Conversion timed out")), 10000)
              )
            ]) as Blob | Blob[];
            
            let fileBlob: Blob;
            if (Array.isArray(jpegBlob)) {
              fileBlob = jpegBlob[0];
            } else {
              fileBlob = jpegBlob;
            }
            
            const jpegFile = new File(
              [fileBlob], 
              file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
              { type: 'image/jpeg' }
            );
            
            toast({
              title: "Conversion Successful",
              description: "Your iPhone photo was successfully converted.",
              variant: "default"
            });
            
            processImageFile(jpegFile);
            
          } catch (error: any) {
            console.error("HEIC conversion error:", error);
            
            // Try direct processing for small files
            if (file.size < 1024 * 1024 * 2) {
              try {
                console.log("Attempting direct processing of HEIC file");
                processImageFile(file);
                return;
              } catch (directProcessError) {
                console.error("Direct HEIC processing failed:", directProcessError);
              }
            }
            
            // Show appropriate error message
            const errorMsg = error.message && (
              error.message.includes("ERR_LIBHEIF") || 
              error.message.includes("format not supported") ||
              error.message.includes("Conversion timed out")
            ) 
              ? "Your iPhone photo format cannot be automatically converted in this browser."
              : "Please convert your iPhone photo using the instructions below.";
            
            toast({
              title: "iPhone Photo Needs Conversion",
              description: errorMsg,
              variant: "destructive"
            });
            
            showHeicInstructions();
          }
          return;
        } catch (error) {
          console.error("HEIC handling error:", error);
          toast({
            title: "Photo Format Issue",
            description: "Please convert your iPhone photo to JPEG format before uploading.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // For non-HEIC images, check if it's a supported format
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
        toast({
          title: "Unsupported file type",
          description: "Please upload a JPEG or PNG image file. Other formats may not work with our analysis system.",
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
      
      processImageFile(file);
    }
  };
  
  // Function to show detailed HEIC conversion instructions
  const showHeicInstructions = () => {
    toast({
      title: "How to Convert iPhone Photos",
      description: "iPhone HEIC photos need conversion: Open Photos app → Tap Share → Tap Options at top → Select Most Compatible → Share the image.",
      variant: "default"
    });
  };
  
  // Helper function to process valid image files
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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
    setUploadProgress(0);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('You need to be logged in');
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      // Use the validated environment variables from env
      const supabaseUrl = env.SUPABASE_URL;
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/meals`,
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
            nutritionalInfo: {
              calories: data.calories,
              protein: data.protein,
              carbohydrates: data.carbohydrates,
              fats: data.fats,
              fiber: data.fiber,
              sugar: data.sugar,
              sodium: data.sodium,
              cholesterol: data.cholesterol,
            }
          }),
        }
      );
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
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
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-semibold mb-6">Upload Your Meal</h2>
      
      {isUploading ? (
        <div className="text-center py-12">
          <LoadingAnimation />
          <Progress value={uploadProgress} className="mt-4" />
          <p className="mt-4 text-muted-foreground">
            {uploadProgress < 100 ? 'Processing your meal data...' : 'Almost done!'}
          </p>
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
              
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Information About iPhone Photos</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Our system works best with <strong>JPEG</strong> and <strong>PNG</strong> images.</p>
                  <p className="mb-2"><strong>iPhone users:</strong> If your photo fails to upload, follow these steps:</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>Open the photo in your Photos app</li>
                    <li>Tap the Share button (square with arrow)</li>
                    <li>Tap <strong>Options</strong> at the top of the screen</li>
                    <li>In <strong>Format</strong>, select <strong>Most Compatible</strong></li>
                    <li>Share the image (to yourself via message/email or save directly)</li>
                    <li>Upload the converted JPEG image</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
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
                      onClick={() => {
                        setPreview(null);
                        form.setValue('image', null);
                      }}
                    >
                      Change Photo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="Enter calories" 
                        {...field}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g) (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.1"
                        placeholder="Enter protein" 
                        {...field}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carbohydrates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbohydrates (g) (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.1"
                        placeholder="Enter carbs" 
                        {...field}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fats (g) (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.1"
                        placeholder="Enter fats" 
                        {...field}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Meal'
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default MealUploadForm;
