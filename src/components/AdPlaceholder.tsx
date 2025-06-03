
"use client";

import { useEffect } from 'react';

export function AdPlaceholder({ className = "" }: { className?: string }) {
  useEffect(() => {
    try {
      if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
        window.adsbygoogle.push({});
      } else {
        // Fallback if adsbygoogle is not ready, though the script in layout.tsx should handle init.
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense push error:", e);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div
      className={`flex justify-center items-center my-4 ${className}`}
      aria-label="Advertisement Area"
    >
      {/* AdSense ad unit code below */}
      {/* <!-- footer-ad --> */}
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-7546609873197379"
           data-ad-slot="5097284517"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}
