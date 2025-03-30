
import { useEffect, useRef } from 'react';

interface GoogleAdDisplayProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
}

const GoogleAdDisplay = ({
  slot,
  format = 'auto',
  style,
  className,
}: GoogleAdDisplayProps) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Google AdSense is loaded
    if (window.adsbygoogle) {
      try {
        // Push ad to AdSense
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log('Ad pushed to Google AdSense');
      } catch (e) {
        console.error('Error loading Google AdSense ad:', e);
      }
    } else {
      console.warn('Google AdSense not loaded yet');
    }
  }, []);

  return (
    <div className={className} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // Replace with actual publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

// Add window.adsbygoogle type definition
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default GoogleAdDisplay;
