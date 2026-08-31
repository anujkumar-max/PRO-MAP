'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { 
  useProjects, 
  useProjectFTEs, 
  useAssignmentsByProject, 
  useProjectNotes, 
  useProjectHealth,
  usePersons 
} from '@/lib/hooks/useRealtimeData';
import { 
  createProject, 
  createAssignment, 
  updateAssignment, 
  deleteAssignment,
  createProjectNote,
  deleteProjectNote,
  createOrUpdateProjectHealth 
} from '@/lib/firestore';
import { cn, formatDate, getCurrentMonth } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Activity, 
  Users, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  GitBranch, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ShieldCheck, 
  FileText, 
  Layers,
  CheckCircle2,
  ExternalLink,
  PieChart as PieIcon
} from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import FlowDiagramView from '@/components/flow/FlowDiagramView';
import type { Assignment, ProjectHealth, Project } from '@/types';

function ProjectsContent() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('id');
  const initialHealth = searchParams.get('health');

  const { data: projects, loading: projectsLoading } = useProjects();
  const { data: projectFTEs, loading: fteLoading } = useProjectFTEs();
  const { data: allPersons } = usePersons();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId);
  const [healthFilter, setHealthFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync state if URL search params change
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setSelectedProjectId(idFromUrl);
    }

    const hFromUrl = searchParams.get('health')?.toLowerCase();
    if (hFromUrl === 'green' || hFromUrl === 'on_track' || hFromUrl === 'ontrack') {
      setHealthFilter('green');
    } else if (hFromUrl === 'amber' || hFromUrl === 'at_risk' || hFromUrl === 'atrisk') {
      setHealthFilter('amber');
    } else if (hFromUrl === 'red' || hFromUrl === 'critical') {
      setHealthFilter('red');
    } else if (hFromUrl === 'all') {
      setHealthFilter('all');
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active' as const,
    hierarchy: { igp: 'IGP (Tech Services)', sp: '', addlSp: '', dsp: '', ci: '', si: '' },
  });

  const loading = projectsLoading || fteLoading;

  // Map project with health status from projectFTEs
  const projectListWithHealth = React.useMemo(() => {
    const fteMap = new Map(projectFTEs.map((f) => [f.projectId, f]));
    return projects.map((p) => {
      const stats = fteMap.get(p.id);
      const healthStatus = (stats?.status || 'green') as 'green' | 'amber' | 'red';
      return {
        ...p,
        stats,
        healthStatus,
      };
    });
  }, [projects, projectFTEs]);

  // Counts for tabs
  const healthCounts = React.useMemo(() => {
    return {
      all: projectListWithHealth.length,
      green: projectListWithHealth.filter((p) => p.healthStatus === 'green').length,
      amber: projectListWithHealth.filter((p) => p.healthStatus === 'amber').length,
      red: projectListWithHealth.filter((p) => p.healthStatus === 'red').length,
    };
  }, [projectListWithHealth]);

  // Filtered by health & search
  const filteredProjects = React.useMemo(() => {
    let list = projectListWithHealth;
    if (healthFilter !== 'all') {
      list = list.filter((p) => p.healthStatus === healthFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.hierarchy?.dsp || '').toLowerCase().includes(q) ||
          (p.hierarchy?.ci || '').toLowerCase().includes(q) ||
          (p.hierarchy?.si || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [projectListWithHealth, healthFilter, search]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = await createProject(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      description: '',
      status: 'Active',
      hierarchy: { igp: 'IGP (Tech Services)', sp: '', addlSp: '', dsp: '', ci: '', si: '' },
    });
    if (newId) {
      setSelectedProjectId(newId);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading projects &amp; personnel...</div>;
  }

  // If a project is selected, render the full Project Detail View
  if (selectedProjectId && selectedProject) {
    return (
      <ProjectDetailPanel 
        project={selectedProject} 
        allPersons={allPersons}
        onBack={() => {
          setSelectedProjectId(null);
          // Clean URL without full reload
          window.history.pushState({}, '', '/projects');
        }} 
      />
    );
  }

  return (
    <div className="p-6 md:p-8 text-white min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
            Projects &amp; Departmental Initiatives
          </h1>
          <p className="text-slate-400 mt-1">
            Filter by Project Health status (On Track, At Risk, Critical) or click any project to view assigned personnel roster.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-all shadow-lg shadow-blue-600/20 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Health Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        
        {/* Health Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => setHealthFilter('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5',
              healthFilter === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            )}
          >
            All Projects
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
              {healthCounts.all}
            </span>
          </button>

          <button
            onClick={() => setHealthFilter('green')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5',
              healthFilter === 'green'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-emerald-400'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            On Track (Green)
            <span className="px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 rounded-full text-[10px] border border-emerald-500/30">
              {healthCounts.green}
            </span>
          </button>

          <button
            onClick={() => setHealthFilter('amber')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5',
              healthFilter === 'amber'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-amber-400'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            At Risk (Amber)
            <span className="px-1.5 py-0.2 bg-amber-950/80 text-amber-300 rounded-full text-[10px] border border-amber-500/30">
              {healthCounts.amber}
            </span>
          </button>

          <button
            onClick={() => setHealthFilter('red')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5',
              healthFilter === 'red'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-red-400'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Critical (Red)
            <span className="px-1.5 py-0.2 bg-red-950/80 text-red-300 rounded-full text-[10px] border border-red-500/30">
              {healthCounts.red}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, command, officers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredProjects.map((project) => {
          const stats = project.stats;
          const isGreen = project.healthStatus === 'green';
          const isAmber = project.healthStatus === 'amber';
          const isRed = project.healthStatus === 'red';
          
          return (
            <motion.div
              key={project.id}
              variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
            >
              <div 
                onClick={() => {
                  setSelectedProjectId(project.id);
                  window.history.pushState({}, '', `/projects?id=${project.id}`);
                }}
                className={cn(
                  "group block h-full p-6 bg-white/5 backdrop-blur-xl border rounded-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-900/20",
                  isGreen && "border-white/10 hover:border-emerald-500/40 border-t-2 border-t-emerald-500/40",
                  isAmber && "border-amber-500/20 hover:border-amber-500/50 border-t-2 border-t-amber-500",
                  isRed && "border-red-500/30 hover:border-red-500/60 border-t-2 border-t-red-500"
                )}
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {project.name}
                  </h3>
                  
                  {/* Health Badge */}
                  <div
                    className={cn(
                      'px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex-shrink-0 flex items-center gap-1.5',
                      isGreen && 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                      isAmber && 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                      isRed && 'bg-red-500/15 text-red-400 border-red-500/30'
                    )}
                  >
                    <span 
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isGreen && "bg-emerald-400 animate-pulse",
                        isAmber && "bg-amber-400",
                        isRed && "bg-red-400"
                      )} 
                    />
                    {isGreen ? 'On Track' : isAmber ? 'At Risk' : 'Critical'}
                  </div>
                </div>
                
                <p className="text-slate-400 text-xs mb-5 line-clamp-2">
                  {project.description || 'Tech Services Project'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" /> Team Size
                    </div>
                    <div className="text-lg font-bold text-white">
                      {stats?.headcount || 0} <span className="text-xs text-slate-400 font-normal">personnel</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> Effective FTE
                    </div>
                    <div className="text-lg font-bold text-white">
                      {stats?.effectiveFTE || 0}
                    </div>
                  </div>
                </div>

                {/* Supervisory Chain */}
                {(project.hierarchy?.dsp || project.hierarchy?.ci || project.hierarchy?.si) && (
                  <div className="text-[11px] text-slate-400 mb-4 bg-slate-900/60 p-2 rounded-lg border border-slate-800 truncate">
                    <span className="text-slate-500">Command: </span>
                    {project.hierarchy.dsp && <span className="text-blue-300">DSP {project.hierarchy.dsp} </span>}
                    {project.hierarchy.ci && <span className="text-slate-300">| CI {project.hierarchy.ci} </span>}
                    {project.hierarchy.si && <span className="text-slate-400">| SI {project.hierarchy.si}</span>}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">Health Status:</span>
                    <span 
                      className={cn(
                        "font-semibold",
                        isGreen && "text-emerald-400",
                        isAmber && "text-amber-400",
                        isRed && "text-red-400"
                      )}
                    >
                      {isGreen ? '🟢 On Track' : isAmber ? '🟡 At Risk' : '🔴 Critical'}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                    View Team <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {filteredProjects.length === 0 && (
          <div className="col-span-full bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <Activity className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-base font-semibold text-white">No projects match the selected filter</p>
            <p className="text-xs">Try selecting a different health status tab or clearing the search query.</p>
          </div>
        )}
      </motion.div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Add New Project</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Project Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. CCTNS, AI4AP, NERS"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  placeholder="Operational scope and objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 min-h-[70px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="pt-2 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Supervisory Command</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">DSP Name</label>
                    <input
                      type="text"
                      placeholder="e.g. V. Vishnu Swaroop"
                      value={formData.hierarchy.dsp}
                      onChange={(e) => setFormData({ ...formData, hierarchy: { ...formData.hierarchy, dsp: e.target.value }})}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">CI / Inspector Name</label>
                    <input
                      type="text"
                      placeholder="e.g. M. Mohan"
                      value={formData.hierarchy.ci}
                      onChange={(e) => setFormData({ ...formData, hierarchy: { ...formData.hierarchy, ci: e.target.value }})}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Sub-Inspector (SI) Name</label>
                    <input
                      type="text"
                      placeholder="e.g. G. Jyothi"
                      value={formData.hierarchy.si}
                      onChange={(e) => setFormData({ ...formData, hierarchy: { ...formData.hierarchy, si: e.target.value }})}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-medium text-white transition-colors"
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

// -------------------------------------------------------------
// Component: Detailed Project View with All Personnel & 4 Tabs
// -------------------------------------------------------------
function ProjectDetailPanel({ 
  project, 
  allPersons, 
  onBack 
}: { 
  project: Project; 
  allPersons: any[]; 
  onBack: () => void; 
}) {
  const { data: assignments, loading: assignmentsLoading } = useAssignmentsByProject(project.id);
  const { data: notes } = useProjectNotes(project.id);
  const { data: healthData } = useProjectHealth(project.id);

  const [activeTab, setActiveTab] = useState<'team' | 'flow' | 'health' | 'notes'>('team');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  // Assignment Form State
  const [assignForm, setAssignForm] = useState({
    personId: '',
    workstreamName: '',
    workstreamDescription: '',
    allocationPercent: 100,
    functionalRole: 'Developer/Engineer',
    raciType: 'Responsible' as any,
    primaryOrSupport: 'Primary' as any,
    reportingTo: ''
  });

  // Note Form State
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });

  // Inline edit state for Team Tab
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Assignment>>({});

  const currentMonth = getCurrentMonth();
  const currentHealth = healthData.find(h => h.month === currentMonth) || {
    projectId: project.id,
    month: currentMonth,
    sanctionedManpower: 0,
    deployedManpower: assignments.length,
    effectiveFTE: assignments.reduce((acc, a) => acc + (a.allocationPercent/100), 0),
    plannedDeliverables: 0,
    completedDeliverables: 0,
    milestoneStatus: 'on_time' as any,
    openIssues: 0,
    resolvedIssues: 0,
    internalDependencies: 0,
    vendorDependencies: 0,
    externalDependencies: 0,
    duplicateRoles: 0,
    underutilisedPersonnel: 0,
    keyPersonDependency: 'Low' as any,
    health: 'green' as any,
    remarks: ''
  };

  const [healthForm, setHealthForm] = useState<Partial<ProjectHealth>>(currentHealth);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.personId) return;
    await createAssignment({
      projectId: project.id,
      ...assignForm
    });
    setShowAddMember(false);
    setAssignForm({
      personId: '',
      workstreamName: '',
      workstreamDescription: '',
      allocationPercent: 100,
      functionalRole: 'Developer/Engineer',
      raciType: 'Responsible',
      primaryOrSupport: 'Primary',
      reportingTo: ''
    });
  };

  const handleUpdateAssignment = async () => {
    if (editingAssignmentId) {
      await updateAssignment(editingAssignmentId, editForm);
      setEditingAssignmentId(null);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProjectNote({
      projectId: project.id,
      title: noteForm.title,
      content: noteForm.content
    });
    setShowAddNote(false);
    setNoteForm({ title: '', content: '' });
  };

  const handleSaveHealth = async () => {
    await createOrUpdateProjectHealth({
      ...healthForm,
      projectId: project.id,
      month: currentMonth
    } as any);
    alert('Project Health updated successfully!');
  };

  const totalEffFTE = assignments.reduce((sum, a) => sum + (a.allocationPercent / 100), 0);

  // Compute Personnel Pie Chart Data for this specific project
  const personnelPieData = React.useMemo(() => {
    const COLORS = [
      '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', 
      '#06B6D4', '#F97316', '#6366F1', '#14B8A6', '#EAB308',
      '#38BDF8', '#4ADE80', '#FB7185', '#A78BFA', '#2DD4BF',
      '#F43F5E', '#84CC16', '#D946EF', '#0EA5E9', '#FBBF24'
    ];

    return assignments.map((a, idx) => {
      const person = allPersons.find((p) => p.id === a.personId);
      return {
        name: person?.name || a.workstreamName || `Officer ${idx + 1}`,
        proId: person?.proId || 'PRO-000',
        rank: person?.rank || 'Staff',
        workstream: a.workstreamName || 'Operational Task',
        value: a.allocationPercent, // % workload on this project
        fte: Math.round((a.allocationPercent / 100) * 10) / 10,
        raci: a.raciType || 'Responsible',
        color: COLORS[idx % COLORS.length]
      };
    });
  }, [assignments, allPersons]);

  return (
    <div className="p-6 md:p-8 text-white min-h-screen space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Projects
        </button>

        <div className="flex items-center gap-3">
          <Link
            href={`/flow/detail?id=${project.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-500/30 rounded-xl text-xs font-semibold text-white transition-all shadow-lg"
          >
            <GitBranch className="w-4 h-4" /> Interactive Flow Diagram <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </div>

      {/* Project Hero Card */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900/60 to-slate-900/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{project.name}</h1>
              <span className={cn(
                'px-3 py-1 text-xs font-bold rounded-full border',
                project.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'
              )}>
                {project.status}
              </span>
            </div>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              {project.description || 'Tech Services Project Operations'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-center px-3 border-r border-slate-700">
              <div className="text-xs text-slate-400">Team Size</div>
              <div className="text-xl font-bold text-white">{assignments.length}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-slate-400">Effective FTE</div>
              <div className="text-xl font-bold text-blue-400">{totalEffFTE.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* Command Hierarchy Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10 text-xs text-slate-300">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">Supervisory Command:</span>
          <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-medium text-blue-300">
            🏛️ {project.hierarchy?.igp || 'IGP (Tech Services)'}
          </span>
          {project.hierarchy?.dsp && (
            <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-medium text-slate-200">
              👮 DSP: {project.hierarchy.dsp}
            </span>
          )}
          {project.hierarchy?.ci && (
            <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-medium text-slate-200">
              👮 CI: {project.hierarchy.ci}
            </span>
          )}
          {project.hierarchy?.si && (
            <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-medium text-slate-200">
              👮 SI: {project.hierarchy.si}
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-2">
        {[
          { id: 'team', label: `Team Members (${assignments.length})`, icon: Users },
          { id: 'flow', label: 'Flow Diagram', icon: GitBranch },
          { id: 'health', label: '10-Point Health Card', icon: ShieldCheck },
          { id: 'notes', label: `Project Notes (${notes.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all",
                isActive 
                  ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl" 
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TEAM MEMBERS */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Header Row with Actions */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Project Personnel &amp; Workstreams</h2>
              <p className="text-xs text-slate-400">
                All officers actively deployed on {project.name} with workstream tasks, allocation %, and RACI roles.
              </p>
            </div>
            <button 
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Assign New Member
            </button>
          </div>

          {/* Personnel Workload & FTE Distribution Pie Chart Card */}
          {assignments.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              
              {/* Left Column: Interactive Donut / Pie Chart */}
              <div className="flex flex-col items-center justify-center lg:border-r border-slate-800 lg:pr-6">
                <div className="w-full flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <PieIcon size={16} className="text-blue-400" />
                    Manpower Workload Share
                  </h3>
                  <span className="text-xs text-slate-400 font-mono font-semibold">
                    {assignments.length} Personnel
                  </span>
                </div>

                <div className="w-full h-56 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={personnelPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {personnelPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-xs text-white space-y-1 z-50">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                  <span className="font-bold text-white text-sm">{data.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-mono font-semibold">{data.proId}</span>
                                </div>
                                <div className="text-slate-300 font-medium">{data.rank} • {data.workstream}</div>
                                <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 text-slate-400 font-mono">
                                  <span>Project Allocation:</span>
                                  <span className="font-bold text-emerald-400">{data.value}% ({data.fte} FTE)</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Stat Indicator */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-white">{totalEffFTE.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Total FTE</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  Hover over slices to inspect individual officer FTE share
                </p>
              </div>

              {/* Right 2 Columns: Personnel Breakdown Roster */}
              <div className="lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
                      <Users size={14} className="text-blue-400" />
                      Team Allocation &amp; Workstreams Breakdown
                    </h4>
                    <span className="text-xs text-emerald-400 font-medium">
                      Project Capacity: <strong className="font-mono">{totalEffFTE.toFixed(1)} FTE</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                    {personnelPieData.map((item, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-3 h-3 rounded-full flex-shrink-0 shadow" style={{ backgroundColor: item.color }} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white truncate">{item.name}</span>
                              <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-slate-400 border border-slate-700 rounded font-mono">{item.proId}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{item.workstream}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="text-xs font-bold font-mono text-white block">{item.value}%</span>
                          <span className="text-[9px] text-slate-400">{item.fte} FTE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                  <div className="p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Total Headcount</span>
                    <span className="text-base font-bold text-white">{assignments.length}</span>
                  </div>
                  <div className="p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Effective Effort</span>
                    <span className="text-base font-bold text-blue-400">{totalEffFTE.toFixed(1)} FTE</span>
                  </div>
                  <div className="p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Avg Allocation</span>
                    <span className="text-base font-bold text-emerald-400">
                      {assignments.length > 0 ? Math.round((totalEffFTE / assignments.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">PRO-ID</th>
                    <th className="p-3.5">Officer Name</th>
                    <th className="p-3.5">Rank &amp; Gen No</th>
                    <th className="p-3.5">Attachment</th>
                    <th className="p-3.5 min-w-[200px]">Workstream / Operational Task</th>
                    <th className="p-3.5 text-right">Alloc %</th>
                    <th className="p-3.5">Functional Role</th>
                    <th className="p-3.5">RACI</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {assignments.map((a) => {
                    const person = allPersons.find((p) => p.id === a.personId);
                    const isEditing = editingAssignmentId === a.id;
                    
                    return (
                      <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md font-mono font-semibold">
                            {person?.proId || 'PRO-000'}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white">
                          {person?.name || 'Unknown Officer'}
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <span className="font-semibold text-slate-200">{person?.rank || 'Staff'}</span>
                          {person?.genNo && <span className="text-slate-400 text-[11px]"> ({person.genNo})</span>}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {person?.deputationType || 'Deputation'}
                        </td>
                        <td className="p-3.5">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input 
                                className="bg-slate-900 border border-slate-700 px-2 py-1 w-full rounded text-white text-xs"
                                value={editForm.workstreamName ?? a.workstreamName}
                                onChange={e => setEditForm({...editForm, workstreamName: e.target.value})}
                              />
                              <textarea 
                                className="bg-slate-900 border border-slate-700 px-2 py-1 w-full rounded text-white text-[11px]"
                                value={editForm.workstreamDescription ?? a.workstreamDescription}
                                onChange={e => setEditForm({...editForm, workstreamDescription: e.target.value})}
                              />
                            </div>
                          ) : (
                            <div className="max-w-md">
                              <div className="font-semibold text-slate-200">{a.workstreamName}</div>
                              {a.workstreamDescription && (
                                <div className="text-[11px] text-slate-400 line-clamp-2 whitespace-normal mt-0.5">
                                  {a.workstreamDescription}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-bold text-slate-200">
                          {isEditing ? (
                            <input 
                              type="number"
                              min="1" max="100"
                              className="bg-slate-900 border border-slate-700 px-2 py-1 w-16 rounded text-white text-right"
                              value={editForm.allocationPercent ?? a.allocationPercent}
                              onChange={e => setEditForm({...editForm, allocationPercent: Number(e.target.value)})}
                            />
                          ) : (
                            <span className={cn(
                              "px-2 py-0.5 rounded font-mono",
                              a.allocationPercent > 100 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                            )}>
                              {a.allocationPercent}%
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {isEditing ? (
                            <input 
                              className="bg-slate-900 border border-slate-700 px-2 py-1 w-32 rounded text-white text-xs"
                              value={editForm.functionalRole ?? a.functionalRole}
                              onChange={e => setEditForm({...editForm, functionalRole: e.target.value})}
                            />
                          ) : (
                            <span className="text-slate-300">{a.functionalRole}</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {isEditing ? (
                            <select
                              className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs"
                              value={editForm.raciType ?? a.raciType}
                              onChange={e => setEditForm({...editForm, raciType: e.target.value as any})}
                            >
                              <option value="Accountable">Accountable</option>
                              <option value="Responsible">Responsible</option>
                              <option value="Consulted">Consulted</option>
                              <option value="Informed">Informed</option>
                            </select>
                          ) : (
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[11px] font-bold",
                              a.raciType === 'Accountable' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              a.raciType === 'Responsible' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                              a.raciType === 'Consulted' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                              "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                            )}>
                              {a.raciType || 'Responsible'}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={handleUpdateAssignment} className="text-emerald-400 hover:bg-emerald-400/20 p-1.5 rounded" title="Save">
                                <Check className="w-4 h-4"/>
                              </button>
                              <button onClick={() => setEditingAssignmentId(null)} className="text-slate-400 hover:bg-slate-700 p-1.5 rounded" title="Cancel">
                                <X className="w-4 h-4"/>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => {
                                  setEditingAssignmentId(a.id);
                                  setEditForm(a);
                                }} 
                                className="text-blue-400 hover:bg-blue-400/20 p-1.5 rounded transition-colors" 
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5"/>
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm(`Remove ${person?.name} from ${project.name}?`)) {
                                    deleteAssignment(a.id);
                                  }
                                }} 
                                className="text-red-400 hover:bg-red-400/20 p-1.5 rounded transition-colors" 
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5"/>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No team members currently assigned to this project. Click &ldquo;Assign New Member&rdquo; above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL INTERACTIVE FLOW DIAGRAM */}
      {activeTab === 'flow' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-400" />
                Organizational Hierarchy &amp; Workstreams Flow
              </h2>
              <p className="text-xs text-slate-400">
                Visualizes the complete command chain (IGP &rarr; DSP &rarr; CI &rarr; SI &rarr; Operational Staff) and individual action items for {project.name}.
              </p>
            </div>
            <Link
              href={`/flow/detail?id=${project.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-md"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" /> Open Dedicated Full-Window Page
            </Link>
          </div>

          <div className="w-full">
            <FlowDiagramView id={project.id} height="h-[780px] md:h-[840px]" />
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH CARD */}
      {activeTab === 'health' && (
        <div className="max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">10-Point Project Health Card ({currentMonth})</h2>
            <p className="text-xs text-slate-400">Monthly audit of milestone progress, deliverables, and operational health.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Health Status</label>
              <select 
                value={healthForm.health} 
                onChange={(e) => setHealthForm({...healthForm, health: e.target.value as any})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="green">🟢 Green (On Track)</option>
                <option value="amber">🟡 Amber (Needs Attention)</option>
                <option value="red">🔴 Red (Critical Risks)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Milestone Status</label>
              <select 
                value={healthForm.milestoneStatus} 
                onChange={(e) => setHealthForm({...healthForm, milestoneStatus: e.target.value as any})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="on_time">On Time</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            
            {['openIssues', 'resolvedIssues', 'plannedDeliverables', 'completedDeliverables'].map(field => (
              <div key={field}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 capitalize">
                  {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <input 
                  type="number"
                  value={healthForm[field as keyof ProjectHealth] as number || 0}
                  onChange={(e) => setHealthForm({...healthForm, [field]: Number(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={handleSaveHealth}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 text-sm"
          >
            Save Health Card Updates
          </button>
        </div>
      )}

      {/* TAB 4: PROJECT NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Project Notes &amp; Minutes</h2>
              <p className="text-xs text-slate-400">Meeting minutes, vendor instructions, and architectural logs.</p>
            </div>
            <button 
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map(note => (
              <div key={note.id} className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-base">{note.title}</h3>
                  <button 
                    onClick={() => {
                      if (confirm('Delete this note?')) deleteProjectNote(note.id);
                    }} 
                    className="text-red-400 hover:bg-red-400/20 p-1.5 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed">{note.content}</p>
                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-700/50">{formatDate(note.createdAt as any)}</div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="col-span-2 p-8 text-center text-slate-400 bg-white/5 rounded-2xl border border-white/10">
                No notes logged yet for {project.name}. Click &ldquo;Add Note&rdquo; above to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Assign Officer to {project.name}</h2>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Select Officer</label>
                <select 
                  required
                  value={assignForm.personId}
                  onChange={(e) => setAssignForm({...assignForm, personId: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Officer --</option>
                  {allPersons.map(p => (
                    <option key={p.id} value={p.id}>{p.proId} - {p.name} ({p.rank})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Workstream Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. CCTNS Integration, SOCINT, ERSS"
                  value={assignForm.workstreamName}
                  onChange={(e) => setAssignForm({...assignForm, workstreamName: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Allocation %</label>
                  <input 
                    required
                    type="number"
                    min="1" max="100"
                    value={assignForm.allocationPercent}
                    onChange={(e) => setAssignForm({...assignForm, allocationPercent: Number(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">RACI</label>
                  <select 
                    value={assignForm.raciType}
                    onChange={(e) => setAssignForm({...assignForm, raciType: e.target.value as any})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Responsible">Responsible (R)</option>
                    <option value="Accountable">Accountable (A)</option>
                    <option value="Consulted">Consulted (C)</option>
                    <option value="Informed">Informed (I)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Functional Role</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Technical Lead, Developer, User Support"
                  value={assignForm.functionalRole}
                  onChange={(e) => setAssignForm({...assignForm, functionalRole: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddMember(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-xs text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white">Assign Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Add Project Note</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Weekly Review Decisions"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Content</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Enter details..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddNote(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-xs text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
