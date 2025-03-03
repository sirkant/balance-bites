
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Trash2, Info, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';

const UploadPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Triggers when file is dropped
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Triggers when file is selected with click
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Handle the selected file
  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open the file selection dialog
  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Clear the selected image
  const clearImage = () => {
    setPreview(null);
    setFileName('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Handle upload and analysis
  const handleAnalyze = () => {
    if (!preview) return;
    
    setIsUploading(true);
    
    // Simulate upload and processing delay
    setTimeout(() => {
      setIsUploading(false);
      navigate('/results');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Upload Your Meal Photo
              </h1>
              <p className="text-lg text-muted-foreground">
                Get instant nutritional analysis from your meal photo. Our AI will analyze 
                the food items and provide detailed nutritional information.
              </p>
            </div>
            
            <div className="animate-scale-in">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 transition-all ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : preview 
                      ? 'border-green-400 bg-green-50/30' 
                      : 'border-border bg-secondary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                  accept="image/*"
                />
                
                {!preview ? (
                  <div className="text-center py-10">
                    <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Upload your meal photo</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Drag and drop your image here, or click to browse
                    </p>
                    <Button onClick={onButtonClick} className="mx-auto">
                      <Camera className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img 
                        src={preview} 
                        alt="Meal preview" 
                        className="max-h-[300px] rounded-lg mx-auto object-contain" 
                      />
                      <button 
                        onClick={clearImage}
                        className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{fileName}</p>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isUploading} 
                      className="mx-auto group"
                    >
                      {isUploading ? (
                        <>Processing...</>
                      ) : (
                        <>
                          Analyze Nutrition
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Tips for best results:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Take the photo from directly above the meal for best accuracy</li>
                    <li>• Ensure good lighting to capture food details clearly</li>
                    <li>• Include all items on the plate in your photo</li>
                    <li>• Avoid shadows or glare on the food</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UploadPage;
