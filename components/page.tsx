'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, QrCode, Users, Zap } from 'lucide-react';


const stats = [
  { value: '1M+', label: 'Polls Created' },
  { value: '5M+', label: 'Votes Cast' },
  { value: '50K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
];

export default function Home() {
  return (
    <div>
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center py-16">
        <h1 className="text-6xl font-bold" style={{ color: 'var(--primary)' }}>
          Welcome to PollCraft
        </h1>

        <p className="mt-3 text-2xl" style={{ color: 'var(--foreground)' }}>
          Create and share polls with your friends.
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link href="/polls/new">
            <Button size="lg">Create a Poll</Button>
          </Link>
        </div>

        {/* Hero Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</div>
              <div style={{ color: 'var(--foreground)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything You Need for Modern Polling
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" style={{ color: 'var(--primary)' }} />
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
                <QrCode className="h-12 w-12 text-primary mx-auto mb-4" style={{ color: 'var(--primary)' }} />
                <CardTitle>QR Code Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Generate QR codes instantly to share your polls with any audience.</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" style={{ color: 'var(--primary)' }} />
                <CardTitle>Easy Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>No signup required for voters. Simple, accessible voting experience.</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" style={{ color: 'var(--primary)' }} />
                <CardTitle>Beautiful Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Comprehensive insights with charts, graphs, and detailed breakdowns.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gray-50" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ color: 'var(--foreground)' }}>
              Create your first poll in 3 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6" style={{ backgroundColor: 'var(--primary)' }}>
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Create Your Poll</h3>
              <p className="text-gray-600" style={{ color: 'var(--foreground)' }}>
                Add your question and options using our intuitive poll builder. Customize settings like voting limits and end dates.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6" style={{ backgroundColor: 'var(--primary)' }}>
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Share & Collect Votes</h3>
              <p className="text-gray-600" style={{ color: 'var(--foreground)' }}>
                Share your poll via link, QR code, or social media. Watch votes come in real-time on your dashboard.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6" style={{ backgroundColor: 'var(--primary)' }}>
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Analyze Results</h3>
              <p className="text-gray-600" style={{ color: 'var(--foreground)' }}>
                Get detailed analytics with beautiful charts, export data, and make informed decisions based on insights.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}