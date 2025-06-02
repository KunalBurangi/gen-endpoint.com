
export function AdPlaceholder({ width = 728, height = 90, className = "" }: { width?: number; height?: number; className?: string }) {
  return (
    <div
      className={`bg-muted border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground my-4 text-center p-2 ${className}`}
      style={{ width: '100%', maxWidth: `${width}px`, minHeight: `${height}px`, margin: '1rem auto' }}
      aria-label="Advertisement placeholder"
    >
      <p className="text-sm">Ad Placeholder ({width}x{height})</p>
      <p className="text-xs mt-1">
        {/*
          Replace this div's content with your Google AdSense ad unit code.
          You get this code when you create an ad unit in your AdSense account.
          It usually looks like an <ins> tag.
          Example (DO NOT USE THIS DIRECTLY - GET YOUR OWN FROM ADSENSE):
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
               data-ad-slot="YOUR_AD_SLOT_ID"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>
               (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        */}
        Paste your AdSense ad unit code here.
      </p>
    </div>
  );
}
