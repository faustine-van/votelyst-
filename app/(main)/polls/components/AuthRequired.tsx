import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Lock, BarChart3 } from "lucide-react";

export function AuthRequired() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">My Polls</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view and manage your polls.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login?redirectedFrom=/polls">
              <Button>Sign In</Button>
            </Link>
            <Link href="/polls/new">
              <Button variant="outline">Create Anonymous Poll</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}