import { getUser } from '@/lib/supabase/server';
import { getStats } from './actions';
import { Hero } from './components/Hero';
import { QuickActions } from './components/QuickActions';
import { Features } from './components/Features';
import { CallToAction } from './components/CallToAction';
import { Process } from './components/Process';

export default async function Home() {
  return (
    <div>
      <Hero />
      <QuickActions />
      <Features />
      <CallToAction />
      <Process />
    </div>
  );
}
