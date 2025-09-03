interface LoadingDisplayProps {
  authLoading: boolean;
}

export function LoadingDisplay({ authLoading }: LoadingDisplayProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {authLoading ? "Loading..." : "Loading your polls..."}
        </p>
      </div>
    </div>
  );
}