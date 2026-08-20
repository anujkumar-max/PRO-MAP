'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  ClipboardList, 
  Target, 
  BarChart3, 
  AlertTriangle, 
  Settings,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Manpower Matrix', href: '/manpower', icon: Users },
  { name: 'Scorecards', href: '/scorecards', icon: ClipboardList },
  { name: 'Commitments', href: '/commitments', icon: Target },
  { name: 'FTE Analytics', href: '/analytics/fte', icon: BarChart3 },
  { name: 'Risk Matrix', href: '/analytics/risks', icon: AlertTriangle },
  { name: 'System Guide', href: '/guide', icon: BookOpen },
  { name: 'Admin', href: '/admin', icon: Settings },
];

// Top 5 items for mobile bottom nav
const mobileNavItems = navItems.slice(0, 5);

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen bg-[#1E293B]/80 backdrop-blur-xl border-r border-white/10 p-6 flex-shrink-0">
        <div className="mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
            PRO-MAP
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
            Tech Services Command
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group",
                    isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 relative z-10", isActive ? "text-blue-400" : "group-hover:text-blue-400 transition-colors")} />
                  <span className="font-medium relative z-10">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">IGP Tech</p>
              <p className="text-xs text-slate-400">Executive View</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#1E293B]/95 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-around px-2 pb-safe">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 p-2">
              <div className={cn(
                "p-2 rounded-full transition-colors",
                isActive ? "bg-blue-600/20 text-blue-400" : "text-slate-400"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-medium text-center",
                isActive ? "text-blue-400" : "text-slate-500"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
