'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProjects } from '@/lib/hooks/useRealtimeData';
import FlowDiagramView from '@/components/flow/FlowDiagramView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function FlowDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const { data: projects, loading } = useProjects();

  if (loading) {
    return <div className="p-8 text-slate-400">Loading flow diagram...</div>;
  }

  if (!id) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <p>No project selected for flow diagram.</p>
        <Link href="/projects" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Go to Projects Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/projects?id=${id}`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project Details
        </button>
      </div>
      <div className="flex-1 w-full">
        <FlowDiagramView id={id} isFullPage={true} height="h-[calc(100vh-140px)] min-h-[700px]" />
      </div>
    </div>
  );
}

export default function FlowDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading flow diagram...</div>}>
      <FlowDetailContent />
    </Suspense>
  );
}
