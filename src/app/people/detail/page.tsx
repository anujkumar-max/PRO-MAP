'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePersons } from '@/lib/hooks/useRealtimeData';
import PersonProfileView from '@/components/people/PersonProfileView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function PersonDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const { data: persons, loading } = usePersons();

  if (loading) {
    return <div className="p-8 text-slate-400">Loading person profile...</div>;
  }

  if (!id) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <p>No person selected.</p>
        <Link href="/manpower" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Go to Manpower Matrix
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-4 md:px-8 pt-6">
        <button
          onClick={() => router.push('/manpower')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Manpower Matrix
        </button>
      </div>
      <PersonProfileView id={id} />
    </div>
  );
}

export default function PersonDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading person profile...</div>}>
      <PersonDetailContent />
    </Suspense>
  );
}
