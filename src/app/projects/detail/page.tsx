'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProjects, usePersons } from '@/lib/hooks/useRealtimeData';
import ProjectDetailView from '@/components/projects/ProjectDetailView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function ProjectDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const { data: projects, loading } = useProjects();

  if (loading) {
    return <div className="p-8 text-slate-400">Loading project details...</div>;
  }

  if (!id) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <p>No project selected.</p>
        <Link href="/projects" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Go to Projects Directory
        </Link>
      </div>
    );
  }

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="p-8 text-center text-red-400 space-y-4">
        <p>Project not found.</p>
        <Link href="/projects" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Go to Projects Directory
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 md:px-8 pt-6">
        <button
          onClick={() => router.push('/projects')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Projects
        </button>
      </div>
      <ProjectDetailView id={id} />
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading project details...</div>}>
      <ProjectDetailContent />
    </Suspense>
  );
}
