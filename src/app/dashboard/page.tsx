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
  Target
} from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboardStats } from '@/lib/hooks/useRealtimeData';
import { cn, getIciColor } from '@/lib/utils';

export default function DashboardPage() {
  const { stats, loading, scorecards } = useDashboardStats();

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

  // Get top performers from current month scorecards
  const topPerformers = [...scorecards]
    .sort((a, b) => b.iciTotal - a.iciTotal)
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Executive Dashboard</h1>
        <p className="text-slate-400 mt-2">Tech Services Overview & Health Status</p>
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
            <p className="text-sm text-slate-500 mt-4"><span className="text-emerald-400 font-medium">{stats.activeProjects}</span> active currently</p>
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
            <p className="text-sm text-slate-500 mt-4">Across all ranks</p>
          </motion.div>
        </Link>

        <Link href="/analytics/fte">
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group border-t-4 border-t-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">Effective FTE</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats.effectiveFTE}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4">Total mapped effort</p>
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
            <p className="text-sm text-slate-500 mt-4">ICI Score {'>'} 80%</p>
          </motion.div>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Health Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 lg:col-span-1 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Project Health</h3>
          <div className="flex-1 min-h-[250px] relative">
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
              <span className="text-3xl font-bold text-white">{stats.activeProjects}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Active</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {healthData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-300">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alerts Grid */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="font-medium text-slate-200">Overallocated Staff</h4>
            </div>
            <div className="flex items-end justify-between mt-4">
              <span className="text-3xl font-bold text-white">{stats.overallocated}</span>
              <span className="text-sm text-slate-400 mb-1">persons {'>'} 100% FTE</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-sky-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <UserX className="w-5 h-5 text-sky-400" />
              </div>
              <h4 className="font-medium text-slate-200">Underutilised</h4>
            </div>
            <div className="flex items-end justify-between mt-4">
              <span className="text-3xl font-bold text-white">{stats.underutilised}</span>
              <span className="text-sm text-slate-400 mb-1">persons {'<'} 50% FTE</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="font-medium text-slate-200">Key-Person Risks</h4>
            </div>
            <div className="flex items-end justify-between mt-4">
              <span className="text-3xl font-bold text-white">{stats.keyPersonRisks}</span>
              <span className="text-sm text-slate-400 mb-1">critical dependencies</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-red-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-red-400" />
              </div>
              <h4 className="font-medium text-slate-200">Delayed Deliverables</h4>
            </div>
            <div className="flex items-end justify-between mt-4">
              <span className="text-3xl font-bold text-white">{stats.delayedDeliverables}</span>
              <span className="text-sm text-slate-400 mb-1">commitments at risk</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Top Performers (Current Month)
            </h3>
            <Link href="/scorecards" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
          </div>
          <div className="space-y-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((scorecard, i) => (
                <div key={scorecard.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{scorecard.personName || scorecard.personId}</p>
                      <p className="text-xs text-slate-400">{scorecard.classification}</p>
                    </div>
                  </div>
                  <div className={cn("text-lg font-bold", getIciColor(scorecard.iciTotal))}>
                    {scorecard.iciTotal}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No scorecards found for current month
              </div>
            )}
          </div>
        </motion.div>

        {/* Placeholder for Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl">
            <div className="text-center">
              <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Activity feed coming soon</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
