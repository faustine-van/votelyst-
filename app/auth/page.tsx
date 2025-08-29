'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, QrCode, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function AuthPage() {
    const { session } = useAuth();

    if (session) {
        redirect('/polls');
    } else {
        redirect('/auth/login');
    }

    return(
        <>
         {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">Create Engaging Polls in Seconds</h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Perfect for professionals, educators, and event organizers. Get real-time feedback with beautiful, shareable
            polls.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Polling Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything You Need for Modern Polling
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Real-time Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Watch votes come in live with instant updates and beautiful visualizations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>QR Code Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Generate QR codes instantly to share your polls with any audience.</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Easy Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>No signup required for voters. Simple, accessible voting experience.</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Beautiful Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Comprehensive insights with charts, graphs, and detailed breakdowns.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}