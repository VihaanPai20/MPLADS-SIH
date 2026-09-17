import { Outlet } from 'react-router-dom';
import { GovernmentHeader } from './GovernmentHeader';
import { GovernmentBanner } from './GovernmentBanner';
import { GovernmentFooter } from './GovernmentFooter';

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-charcoal font-sans overflow-x-hidden">
      <GovernmentHeader />
      <GovernmentBanner />
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 w-full max-w-7xl mx-auto">
        <Outlet />
      </main>
      <GovernmentFooter />
    </div>
  );
}
