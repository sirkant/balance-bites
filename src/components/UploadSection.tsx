
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Camera, ImagePlus, ArrowRight } from 'lucide-react';

const UploadSection = () => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              Get Started
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Upload Your Meal Photo
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get instant nutritional insights from just a photo. Our AI analyzes your meal and provides 
              detailed information about its nutritional content.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Take a clear photo</h3>
                  <p className="text-sm text-muted-foreground">Capture your entire meal from above for best results</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Upload it instantly</h3>
                  <p className="text-sm text-muted-foreground">Drag and drop or select a file from your device</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Get detailed analysis</h3>
                  <p className="text-sm text-muted-foreground">View comprehensive nutritional breakdown within seconds</p>
                </div>
              </div>
            </div>
            
            <Button size="lg" asChild className="group">
              <Link to="/upload">
                Try It Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
          <div className="order-1 md:order-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div 
              className="border-2 border-dashed border-primary/30 rounded-xl p-8 bg-blue-50/50 transition-all duration-300"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="text-center py-12">
                <div className={`mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 ${isHovering ? 'scale-110' : ''}`}>
                  <ImagePlus className={`h-10 w-10 text-primary transition-all duration-300 ${isHovering ? 'scale-110' : ''}`} />
                </div>
                <h3 className="text-xl font-medium mb-2">Upload your meal photo</h3>
                <p className="text-muted-foreground mb-6">
                  Drag and drop or click to select a photo
                </p>
                <Button asChild>
                  <Link to="/upload">Upload Photo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Add the BarChart3 component since it's used in the component
const BarChart3 = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
};

export default UploadSection;
