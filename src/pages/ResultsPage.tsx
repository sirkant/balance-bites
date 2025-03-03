
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Analysis from '@/components/Analysis';
import { Button } from '@/components/ui/button';
import { Camera, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResultsPage = () => {
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
              <Button variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Upload Another
              </Button>
              <Button variant="outline" size="sm">
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
                    src="https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                    alt="Analyzed meal" 
                    className="w-full h-auto rounded-lg object-cover" 
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Just now
                  </div>
                </div>
                
                <h3 className="font-medium mb-2">Detected Items</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex justify-between text-sm bg-secondary/50 p-2 rounded">
                    <span>Grilled Chicken Breast</span>
                    <span className="font-mono">120g</span>
                  </li>
                  <li className="flex justify-between text-sm bg-secondary/50 p-2 rounded">
                    <span>Brown Rice</span>
                    <span className="font-mono">1 cup</span>
                  </li>
                  <li className="flex justify-between text-sm bg-secondary/50 p-2 rounded">
                    <span>Steamed Broccoli</span>
                    <span className="font-mono">80g</span>
                  </li>
                  <li className="flex justify-between text-sm bg-secondary/50 p-2 rounded">
                    <span>Olive Oil</span>
                    <span className="font-mono">1 tbsp</span>
                  </li>
                </ul>
                
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-xl font-bold">475</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-xl font-bold text-green-500">B+</p>
                  </div>
                </div>
                
                <Button className="w-full" asChild>
                  <Link to="/dashboard">Save to Dashboard</Link>
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Analysis />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResultsPage;
