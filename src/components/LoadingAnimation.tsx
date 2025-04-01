
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface LoadingAnimationProps {
  messages?: string[];
}

const defaultMessages = [
  "Analyzing your meal...",
  "Identifying ingredients...",
  "Calculating nutritional values...",
  "Estimating calories...",
  "Evaluating protein content...",
  "Measuring carbohydrates...",
  "Assessing fat content...",
  "Finalizing your nutrition report..."
];

export const LoadingAnimation = ({ 
  messages = defaultMessages 
}: LoadingAnimationProps) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  
  useEffect(() => {
    const duration = 8000; // Total animation duration in ms
    const interval = 100; // Update interval in ms
    const messageInterval = duration / messages.length;
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Calculate progress
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      // Update message based on progress
      const messageIndex = Math.min(
        Math.floor(elapsed / messageInterval),
        messages.length - 1
      );
      setCurrentMessage(messageIndex);
      
      // Continue animation if not complete
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      }
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [messages]);
  
  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="w-24 h-24 mb-8 relative">
        <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
        <div 
          className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" 
          style={{ animationDuration: '1.5s' }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-4 text-center">
        {messages[currentMessage]}
      </h3>
      
      <Progress value={progress} className="w-full max-w-md mb-8" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-md">
        {['Proteins', 'Carbs', 'Fats', 'Vitamins'].map((item) => (
          <div key={item} className="bg-secondary/40 rounded-lg p-3 text-center">
            <Skeleton className="h-4 w-12 mx-auto mb-2" />
            <p className="text-sm font-medium">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingAnimation;
