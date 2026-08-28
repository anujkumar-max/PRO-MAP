'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  ClipboardList, 
  Target, 
  BarChart3, 
  AlertTriangle, 
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: '' },
  { name: 'Projects', href: '/projects', icon: FolderKanban, badge: '35' },
  { name: 'Manpower Matrix', href: '/manpower', icon: Users, badge: '142' },
  { name: 'Scorecards', href: '/scorecards', icon: ClipboardList, badge: '' },
  { name: 'Commitments', href: '/commitments', icon: Target, badge: '' },
  { name: 'FTE Analytics', href: '/analytics/fte', icon: BarChart3, badge: '' },
  { name: 'Risk Matrix', href: '/analytics/risks', icon: AlertTriangle, badge: '' },
  { name: 'System Guide', href: '/guide', icon: BookOpen, badge: '' },
  { name: 'Admin', href: '/admin', icon: Settings, badge: '' },
];

// Top 5 items for mobile bottom nav
const mobileNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Manpower', href: '/manpower', icon: Users },
  { name: 'Scorecards', href: '/scorecards', icon: ClipboardList },
  { name: 'Risks', href: '/analytics/risks', icon: AlertTriangle },
];

export function Sidebar() {
  const pathname = usePathname();
  // Default to collapsed for a compact, space-maximizing view
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Sync preference with localStorage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('promap_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('promap_sidebar_collapsed', String(nextState));
    }
  };

  return (
    <>
      {/* Desktop Collapsible / Compact Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col h-screen bg-[#0F172A]/95 backdrop-blur-2xl border-r border-slate-800/80 flex-shrink-0 transition-all duration-300 ease-in-out relative z-30",
          isCollapsed ? "w-20 p-3" : "w-64 p-5"
        )}
      >
        {/* Toggle Button on border */}
        <button
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-200 flex items-center justify-center shadow-lg z-40 group cursor-pointer"
          title={isCollapsed ? "Expand menu" : "Minimize menu"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          )}
        </button>

        {/* Brand / Logo Header */}
        <div className={cn("mb-6 flex items-center transition-all duration-300", isCollapsed ? "justify-center pt-2" : "px-2 pt-1")}>
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  PRO-MAP
                </h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Tech Services
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <div key={item.name} className="relative group">
                <Link href={item.href} className="block">
                  <div
                    className={cn(
                      "flex items-center rounded-xl transition-all duration-200 relative",
                      isCollapsed 
                        ? "justify-center w-12 h-12 mx-auto" 
                        : "gap-3.5 px-3.5 py-3",
                      isActive 
                        ? "text-white bg-blue-600/20 border border-blue-500/30 shadow-md shadow-blue-950/40 font-semibold" 
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
                    )}
                  >
                    {/* Active accent pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSidePill"
                        className={cn(
                          "absolute bg-blue-500 rounded-full",
                          isCollapsed 
                            ? "left-0.5 top-2.5 bottom-2.5 w-1" 
                            : "left-0 top-2.5 bottom-2.5 w-1"
                        )}
                        initial={false}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}

                    <Icon 
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-colors duration-200",
                        isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-300"
                      )} 
                    />

                    {/* Expanded Label */}
                    {!isCollapsed && (
                      <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                        {item.name}
                      </span>
                    )}

                    {/* Badge if expanded */}
                    {!isCollapsed && item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Floating Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-blue-400" : "bg-slate-500")} />
                    {item.name}
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded-full font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Profile / Command Footer */}
        <div className={cn("mt-auto pt-4 border-t border-slate-800/80 transition-all", isCollapsed ? "px-1" : "px-2")}>
          <div 
            className={cn(
              "flex items-center rounded-xl bg-slate-900/60 border border-slate-800 relative group cursor-pointer hover:border-slate-700 transition-all",
              isCollapsed ? "justify-center p-2" : "gap-3 p-2.5"
            )}
            title="IGP Tech Services • Executive Command"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold text-xs">
              IGP
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap flex-1">
                <p className="text-xs font-bold text-white leading-tight">IGP Tech Services</p>
                <p className="text-[10px] text-slate-400 font-medium">Executive Command</p>
              </div>
            )}

            {/* Tooltip on hover when collapsed */}
            {isCollapsed && (
              <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                <p className="font-bold text-blue-400">IGP Tech Services</p>
                <p className="text-[10px] text-slate-400">Executive Command View</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-800 z-50 flex items-center justify-around px-2 pb-safe shadow-2xl">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-all",
                isActive ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg transition-colors",
                isActive ? "bg-blue-500/20 text-blue-400" : "text-slate-400"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-center tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Mobile Guide/More link */}
        <Link 
          href="/guide" 
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-all",
            pathname === '/guide' ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <div className={cn(
            "p-1 rounded-lg transition-colors",
            pathname === '/guide' ? "bg-blue-500/20 text-blue-400" : "text-slate-400"
          )}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-center tracking-tight">
            Guide
          </span>
        </Link>
      </div>
    </>
  );
}
