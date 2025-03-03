
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import UploadSection from '@/components/UploadSection';
import Footer from '@/components/Footer';

const Index = () => {
  console.log('Rendering Index page');
  
  return (
    <div className="min-h-screen flex flex-col">
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
