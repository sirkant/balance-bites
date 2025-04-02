
import { useEffect, useRef } from 'react';

interface GoogleAdDisplayProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  responsive?: boolean;
  className?: string;
}

const GoogleAdDisplay = ({
  slot,
  format = 'auto',
  responsive = true,
  className = ''
}: GoogleAdDisplayProps) => {
  const adContainer = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only attempt to load ads if we're in a browser environment
    if (typeof window === 'undefined' || !adContainer.current) return;
    
    try {
      // Clear the current ad container contents
      if (adContainer.current.innerHTML) {
        adContainer.current.innerHTML = '';
      }
      
      // @ts-ignore - Google AdSense is loaded globally via a script tag
      if (window.adsbygoogle) {
        const adsByGoogle = document.createElement('ins');
        adsByGoogle.className = 'adsbygoogle';
        adsByGoogle.style.display = 'block';
        adsByGoogle.style.overflow = 'hidden';
        adsByGoogle.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXX'); // Should be replaced with actual ad client ID
        adsByGoogle.setAttribute('data-ad-slot', slot);
        
        if (format !== 'auto') {
          adsByGoogle.setAttribute('data-ad-format', format);
        }
        
        if (responsive) {
          adsByGoogle.setAttribute('data-full-width-responsive', 'true');
        }
        
        adContainer.current.appendChild(adsByGoogle);
        
        // @ts-ignore - Push the ad to the Google AdSense queue
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading Google AdSense ad:', error);
    }
  }, [slot, format, responsive]);
  
  return (
    <div ref={adContainer} className={className} />
  );
};

export default GoogleAdDisplay;
