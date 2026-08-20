'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProjects, useProjectFTEs } from '@/lib/hooks/useRealtimeData';
import { createProject } from '@/lib/firestore';
import { cn } from '@/lib/utils';
import { Plus, Search, Activity, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const { data: projects, loading: projectsLoading } = useProjects();
  const { data: projectFTEs, loading: fteLoading } = useProjectFTEs();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active' as const,
    hierarchy: { igp: '', sp: '', addlSp: '', dsp: '', ci: '', si: '' },
  });

  const loading = projectsLoading || fteLoading;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      description: '',
      status: 'Active',
      hierarchy: { igp: '', sp: '', addlSp: '', dsp: '', ci: '', si: '' },
    });
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading projects...</div>;
  }

  return (
    <div className="p-6 md:p-8 text-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Projects
          </h1>
          <p className="text-slate-400 mt-1">Manage all departmental projects and initiatives.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Project
        </button>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredProjects.map((project) => {
          const stats = projectFTEs.find((f) => f.projectId === project.id);
          
          return (
            <motion.div
              key={project.id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            >
              <Link href={`/projects/${project.id}`}>
                <div className="group block h-full p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {project.name}
                    </h3>
                    <div
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full border',
                        project.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : project.status === 'Completed'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      )}
                    >
                      {project.status}
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Users className="w-4 h-4" /> Team Size
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {stats?.headcount || 0}
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Clock className="w-4 h-4" /> Eff. FTE
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {stats?.effectiveFTE || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">Health:</span>
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          stats?.status === 'green'
                            ? 'bg-emerald-500'
                            : stats?.status === 'amber'
                            ? 'bg-amber-500'
                            : stats?.status === 'red'
                            ? 'bg-red-500'
                            : 'bg-slate-500'
                        )}
                      />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold">Add New Project</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Project Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="pt-2 border-t border-slate-800">
                <h3 className="text-sm font-medium mb-3">Hierarchy</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">DSP</label>
                    <input
                      type="text"
                      value={formData.hierarchy.dsp}
                      onChange={(e) => setFormData({ ...formData, hierarchy: { ...formData.hierarchy, dsp: e.target.value }})}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">CI</label>
                    <input
                      type="text"
                      value={formData.hierarchy.ci}
                      onChange={(e) => setFormData({ ...formData, hierarchy: { ...formData.hierarchy, ci: e.target.value }})}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">SI</label>
                    <input
                      type="text"
                      value={formData.hierarchy.si}
                      onChange={(e) => setFormData({ ...formData, hierarchy: { ...formData.hierarchy, si: e.target.value }})}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
