
import { useEffect, useRef } from 'react';

interface GoogleAdDisplayProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

const GoogleAdDisplay = ({ 
  slot, 
  format = 'auto', 
  responsive = true,
  className = ''
}: GoogleAdDisplayProps) => {
  const adRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    try {
      // Check if Google AdSense is loaded
      if (window.adsbygoogle) {
        // Create a new ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        console.warn('Google AdSense not loaded yet');
      }
    } catch (error) {
      console.error('Error loading Google AdSense ad:', error);
    }
  }, []);

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className={`adsbygoogle ${responsive ? 'adsbygoogle-responsive' : ''}`}
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_GOOGLE_AD_CLIENT || 'ca-pub-placeholder'}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default GoogleAdDisplay;
