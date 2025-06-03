
"use client";

import { useEffect } from 'react';

export function AdPlaceholder({ className = "" }: { className?: string }) {
  useEffect(() => {
    try {
      // Ensure adsbygoogle is an array and push is a function before calling.
      if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
        window.adsbygoogle.push({});
      } else {
        // Fallback or re-initialize if needed, though the main script in layout.tsx should handle this.
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (e) {
      // Catch and log any errors during the ad push.
      console.error("AdSense push error:", e);
    }
  }, []); // Empty dependency array ensures this runs once on mount.

  return (
    <div
      // Changed to w-full to help AdSense determine available width.
      // Removed flex centering as 'display:block' on 'ins' should use available width.
      className={`w-full my-4 ${className}`}
      aria-label="Advertisement Area"
    >
      <ins className="adsbygoogle"
           style={{ display: 'block' }} // 'display:block' is important for AdSense width calculation.
           data-ad-client="ca-pub-7546609873197379"
           data-ad-slot="5097284517"
           data-ad-format="auto" // 'auto' allows AdSense to choose the ad size based on container.
           // data-full-width-responsive="true" // Removed as 'auto' format often handles this,
                                              // and this attribute can sometimes cause issues if parent width
                                              // is ambiguous at the time of ad call.
           ></ins>
    </div>
  );
}
