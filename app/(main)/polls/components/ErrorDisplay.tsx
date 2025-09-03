import { Button } from "@/components/ui/Button";

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="container py-8 m-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-red-600">Error Loading Polls</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    </div>
  );
}