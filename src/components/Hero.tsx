
import { ArrowRight, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10" />
      
      {/* Background circles */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden -z-10">
        <div className="absolute -top-[300px] -left-[300px] w-[600px] h-[600px] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -top-[200px] -right-[300px] w-[500px] h-[500px] rounded-full bg-green-100/30 blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
          <div className="order-2 md:order-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              Introducing NutriVision
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Discover Your Nutritional Balance
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 md:pr-8">
              Upload photos of your meals and get instant, detailed nutritional analysis. 
              Focus on nutrient diversity, not just calories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="group">
                <Link to="/upload">
                  Upload Your Meal
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={scrollToFeatures}>
                Learn More
                <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
              </Button>
            </div>
          </div>
          
          <div className="order-1 md:order-2 relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-70" />
              <div className="relative glass-panel p-1 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Healthy meal with vegetables and proteins"
                  className="w-full h-auto rounded-xl object-cover"
                />
              </div>
              
              {/* Floating UI elements for visual interest */}
              <div className="absolute top-6 -right-4 glass-panel px-4 py-3 shadow-lg rounded-xl animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 text-xs font-semibold">A+</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nutrient Score</p>
                    <p className="text-xs text-muted-foreground">Great balance!</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 glass-panel px-4 py-3 shadow-lg rounded-xl animate-float" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 text-sm">+2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Protein</p>
                    <p className="text-xs text-muted-foreground">Above your target</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scrolling indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-pulse-subtle">
        <div className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-2">Scroll to explore</p>
          <ArrowDown className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
