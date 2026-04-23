'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'Admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/agent');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#fcf8ff] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-on-surface-variant text-sm">Loading PropCRM...</span>
      </div>
    </div>
  );
}
// Updated on Wed Apr 29 22:56:09 PKT 2026
// Updated on Wed Apr 29 22:56:09 PKT 2026
// Updated on Wed Apr 29 22:56:09 PKT 2026
// Updated on Wed Apr 29 22:56:09 PKT 2026
// Updated on Wed Apr 29 22:56:09 PKT 2026
// Updated on Wed Apr 29 22:56:09 PKT 2026
// Updated on Wed Apr 29 22:56:09 PKT 2026
