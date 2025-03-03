
import { Camera, BarChart3, History, TrendingUp, Zap, Shield } from 'lucide-react';

const featuresData = [
  {
    icon: <Camera className="h-8 w-8 text-primary" />,
    title: "Snap & Analyze",
    description: "Take a photo of your meal and get instant nutritional analysis. No manual tracking or guesswork required."
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: "Comprehensive Breakdown",
    description: "See detailed macronutrients, vitamins, and minerals. Focus on nutrient diversity, not just calories."
  },
  {
    icon: <History className="h-8 w-8 text-primary" />,
    title: "Meal History",
    description: "Review past meals and see how your nutritional intake evolves over time."
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Progress Tracking",
    description: "Track nutritional trends to identify patterns and opportunities for improvement."
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Instant Insights",
    description: "Get personalized recommendations based on your nutritional needs and goals."
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Private & Secure",
    description: "Your data is encrypted and never shared. We prioritize your privacy and security."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
            Key Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How NutriVision Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Our intelligent platform analyzes your meals to provide comprehensive nutritional insights, 
            helping you make informed dietary choices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
          {featuresData.map((feature, index) => (
            <div 
              key={index} 
              className="bg-secondary/40 backdrop-blur-sm rounded-xl p-6 card-hover animate-fade-in"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
