
import { useEffect } from 'react';

interface GoogleAdsScriptProps {
  adClient: string;
}

const GoogleAdsScript = ({ adClient }: GoogleAdsScriptProps) => {
  useEffect(() => {
    // Create script element for Google Ads
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.adClient = adClient;
    
    // Add the script to the document
    document.head.appendChild(script);
    
    return () => {
      // Clean up on component unmount
      try {
        document.head.removeChild(script);
      } catch (e) {
        console.log('Google Ads script already removed');
      }
    };
  }, [adClient]);

  return null; // This component doesn't render anything
};

export default GoogleAdsScript;
