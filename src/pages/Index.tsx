
import { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import UploadSection from '@/components/UploadSection';
import Footer from '@/components/Footer';
import { RenderTest } from '@/utils/renderTest';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  console.log('Rendering Index page');
  
  useEffect(() => {
    console.log('Index page mounted');
    
    // Show a toast to test toast functionality
    setTimeout(() => {
      toast({
        title: "Index page loaded",
        description: "The page has loaded successfully",
      });
      console.log('Index page toast triggered');
    }, 1000);
    
    return () => {
      console.log('Index page unmounting');
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Add render test to verify this component is rendering */}
      <RenderTest id="index-page-test" />
      
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <UploadSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
