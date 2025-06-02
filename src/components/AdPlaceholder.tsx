
export function AdPlaceholder({ width = 728, height = 90, className = "" }: { width?: number; height?: number; className?: string }) {
  return (
    <div
      className={`bg-muted border border-dashed border-border flex items-center justify-center text-muted-foreground my-4 ${className}`}
      style={{ width: '100%', maxWidth: `${width}px`, height: `${height}px`, margin: '1rem auto' }}
      aria-label="Advertisement placeholder"
    >
      Ad Placeholder ({width}x{height})
    </div>
  );
}
