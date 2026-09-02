'use client';

import { motion, type Variants } from 'framer-motion';
import { 
  FolderKanban, 
  Users, 
  BarChart3, 
  Activity, 
  AlertTriangle,
  Clock,
  UserX,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboardStats } from '@/lib/hooks/useRealtimeData';
import { cn } from '@/lib/utils';

import { useState } from 'react';

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const { stats, loading } = useDashboardStats(selectedMonth);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const healthData = [
    { name: 'On Track', value: stats.projectsGreen, color: '#10B981' },
    { name: 'At Risk', value: stats.projectsAmber, color: '#F59E0B' },
    { name: 'Critical', value: stats.projectsRed, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-400 mt-2">Tech Services Overview &amp; Command Health Status</p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Review Cycle:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs font-bold text-blue-400 focus:outline-none cursor-pointer"
          >
            <option value="2026-09" className="bg-slate-900 text-white">September 2026 (Active)</option>
            <option value="2026-08" className="bg-slate-900 text-white">August 2026</option>
            <option value="2026-07" className="bg-slate-900 text-white">July 2026</option>
          </select>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Stat Cards */}
        <Link href="/projects">
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group border-t-4 border-t-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Projects</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats.totalProjects}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <FolderKanban className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4"><span className="text-emerald-400 font-medium">{stats.activeProjects}</span> active projects</p>
          </motion.div>
        </Link>

        <Link href="/manpower">
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group border-t-4 border-t-indigo-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Personnel</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats.totalPersonnel}</h3>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              <span className="text-emerald-400 font-medium">{stats.staffPersonnel ?? 140} Staff</span> + <span className="text-purple-400 font-medium">{stats.officerPersonnel ?? 27} Officers</span>
            </p>
          </motion.div>
        </Link>

        <Link href="/analytics/fte">
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group border-t-4 border-t-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">Staff Effective FTE</p>
                <h3 className="text-3xl font-bold text-white mt-2">{(stats.staffFTE ?? stats.effectiveFTE).toFixed(1)}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              <span className="text-emerald-400 font-medium">140.0 Staff</span> + <span className="text-blue-400 font-medium">27.0 Officers</span>
            </p>
          </motion.div>
        </Link>

        <Link href="/scorecards">
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group border-t-4 border-t-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">High Performers</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats.highPerformers}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4">ICI Score &gt; 80%</p>
          </motion.div>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Health Card - Clickable to Projects Module */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 lg:col-span-1 flex flex-col hover:border-blue-500/40 transition-all group"
        >
          <div className="flex justify-between items-center mb-4">
            <Link href="/projects" className="flex items-center gap-2 group/title">
              <h3 className="text-lg font-semibold text-white group-hover/title:text-blue-400 transition-colors">
                Project Health
              </h3>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover/title:text-blue-400 group-hover/title:translate-x-1 transition-all" />
            </Link>
            <Link 
              href="/projects" 
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
            >
              View Projects →
            </Link>
          </div>

          {/* Donut Chart - Click to view all projects */}
          <Link href="/projects" className="flex-1 min-h-[220px] relative block cursor-pointer group/chart" title="Click to view all projects">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white group-hover/chart:text-blue-400 transition-colors">{stats.activeProjects}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Active Projects</span>
            </div>
          </Link>

          {/* Health Status Breakdown - Clickable chips with direct filter */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800">
            <Link 
              href="/projects?health=green" 
              className="flex flex-col items-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/50 transition-all group/chip"
              title="Filter On Track projects"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-slate-300 group-hover/chip:text-emerald-400 font-semibold">On Track</span>
              </div>
              <span className="text-base font-extrabold font-mono text-emerald-400">{stats.projectsGreen}</span>
            </Link>

            <Link 
              href="/projects?health=amber" 
              className="flex flex-col items-center p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/50 transition-all group/chip"
              title="Filter At Risk projects"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[11px] text-slate-300 group-hover/chip:text-amber-400 font-semibold">At Risk</span>
              </div>
              <span className="text-base font-extrabold font-mono text-amber-400">{stats.projectsAmber}</span>
            </Link>

            <Link 
              href="/projects?health=red" 
              className="flex flex-col items-center p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/50 transition-all group/chip"
              title="Filter Critical projects"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[11px] text-slate-300 group-hover/chip:text-red-400 font-semibold">Critical</span>
              </div>
              <span className="text-base font-extrabold font-mono text-red-400">{stats.projectsRed}</span>
            </Link>
          </div>
        </motion.div>

        {/* Alerts Grid — 4 clickable cards */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Balanced & Optimal → Risk Matrix */}
          <Link href="/analytics/risks">
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500 hover:bg-white/10 transition-colors cursor-pointer group h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="font-medium text-slate-200">Balanced & Optimal</h4>
              </div>
              <div className="flex items-end justify-between mt-4">
                <span className="text-3xl font-bold text-white">{stats.balancedOptimal}</span>
                <span className="text-sm text-slate-400 mb-1">persons at 100% FTE</span>
              </div>
            </div>
          </Link>

          {/* Overallocated → Risk Matrix */}
          <Link href="/analytics/risks">
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500 hover:bg-white/10 transition-colors cursor-pointer group h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="font-medium text-slate-200">Overallocated Staff</h4>
              </div>
              <div className="flex items-end justify-between mt-4">
                <span className="text-3xl font-bold text-white">{stats.overallocated}</span>
                <span className="text-sm text-slate-400 mb-1">persons {'>'} 100% FTE</span>
              </div>
            </div>
          </Link>

          {/* Underutilised → Risk Matrix */}
          <Link href="/analytics/risks">
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-sky-500 hover:bg-white/10 transition-colors cursor-pointer group h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-sky-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <UserX className="w-5 h-5 text-sky-400" />
                </div>
                <h4 className="font-medium text-slate-200">Underutilised</h4>
              </div>
              <div className="flex items-end justify-between mt-4">
                <span className="text-3xl font-bold text-white">{stats.underutilised}</span>
                <span className="text-sm text-slate-400 mb-1">persons {'<'} 50% FTE</span>
              </div>
            </div>
          </Link>

          {/* Delayed Deliverables → Commitments */}
          <Link href="/commitments">
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-red-500 hover:bg-white/10 transition-colors cursor-pointer group h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
                <h4 className="font-medium text-slate-200">Delayed Deliverables</h4>
              </div>
              <div className="flex items-end justify-between mt-4">
                <span className="text-3xl font-bold text-white">{stats.delayedDeliverables}</span>
                <span className="text-sm text-slate-400 mb-1">commitments at risk</span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
