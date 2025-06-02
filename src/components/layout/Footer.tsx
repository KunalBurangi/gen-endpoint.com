export function Footer() {
  return (
    <footer className="bg-card border-t text-center py-6">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} API Endpoint Explorer. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
