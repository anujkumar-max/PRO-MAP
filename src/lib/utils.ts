// ============================================
// Utility Functions (cn, formatting, etc.)
// ============================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(date);
  }
}

export function formatMonth(month: string): string {
  try {
    const [year, m] = month.split('-');
    const date = new Date(parseInt(year), parseInt(m) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  } catch {
    return month;
  }
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getHealthColor(status: 'green' | 'amber' | 'red' | string): string {
  switch (status) {
    case 'green': return 'text-emerald-400';
    case 'amber': return 'text-amber-400';
    case 'red': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

export function getHealthBg(status: 'green' | 'amber' | 'red' | string): string {
  switch (status) {
    case 'green': return 'bg-emerald-500/10 border-emerald-500/20';
    case 'amber': return 'bg-amber-500/10 border-amber-500/20';
    case 'red': return 'bg-red-500/10 border-red-500/20';
    default: return 'bg-slate-500/10 border-slate-500/20';
  }
}

export function getStatusEmoji(status: string): string {
  switch (status) {
    case 'green': return '🟢';
    case 'amber': return '🟡';
    case 'red': return '🔴';
    case 'pending': return '⏳';
    default: return '⚪';
  }
}

export function getIciColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 80) return 'text-blue-400';
  if (score >= 70) return 'text-sky-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

export function getIciBg(score: number): string {
  if (score >= 90) return 'bg-emerald-500/10';
  if (score >= 80) return 'bg-blue-500/10';
  if (score >= 70) return 'bg-sky-500/10';
  if (score >= 60) return 'bg-amber-500/10';
  return 'bg-red-500/10';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// ============================================
// Police Rank Role Classification (Executive, Supervisory, Monitoring, Operational)
// ============================================

export type RankRoleTier = 'Executive' | 'Supervisory' | 'Monitoring' | 'Operational';

export interface RankRoleMeta {
  tier: RankRoleTier;
  label: string;
  badgeClass: string;
  textClass: string;
  icon: string;
}

export function getRankRole(rankText: string | undefined | null): RankRoleMeta {
  if (!rankText) {
    return {
      tier: 'Operational',
      label: 'Operational',
      badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
      textClass: 'text-slate-300',
      icon: '⚙️',
    };
  }

  const normalized = rankText.trim().toUpperCase();

  // 1. Executive Tier: IGP, ADGP, DGP
  if (
    normalized.includes('IGP') ||
    normalized.includes('ADGP') ||
    normalized.includes('DGP') ||
    normalized.includes('INSPECTOR GENERAL')
  ) {
    return {
      tier: 'Executive',
      label: 'Executive',
      badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      textClass: 'text-purple-400',
      icon: '🏛️',
    };
  }

  // 2. Supervisory Tier: DSP, Addl SP, SP
  if (
    normalized === 'DSP' ||
    normalized.includes('DSP') ||
    normalized.includes('DYSP') ||
    normalized.includes('DY. SP') ||
    normalized.includes('DEPUTY SUP') ||
    normalized.includes('ADDL SP') ||
    normalized.includes('ADDL. SP') ||
    normalized.includes('ADDITIONAL SP') ||
    normalized === 'SP' ||
    normalized.includes('SUPERINTENDENT OF POLICE')
  ) {
    return {
      tier: 'Supervisory',
      label: 'Supervisory',
      badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      textClass: 'text-blue-400',
      icon: '🛡️',
    };
  }

  // 3. Monitoring Tier: CI, Inspector, SI, Sub-Inspector, ASI, Assistant Sub-Inspector
  if (
    normalized === 'CI' ||
    normalized.includes('CIRCLE INSPECTOR') ||
    normalized.includes('INSPECTOR') || // covers Inspector & CI
    normalized === 'SI' ||
    normalized.includes('SUB INSPECTOR') ||
    normalized.includes('SUB-INSPECTOR') ||
    normalized.includes('SUB. INSPECTOR') ||
    normalized === 'ASI' ||
    normalized.includes('ASSISTANT SUB') ||
    normalized.includes('ASST SUB') ||
    normalized.includes('ASST. SUB') ||
    normalized.includes('ASST. SI')
  ) {
    return {
      tier: 'Monitoring',
      label: 'Monitoring',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      textClass: 'text-amber-400',
      icon: '👁️',
    };
  }

  // 4. Operational Tier: HC, PC, WPC, ARPC, DEO, Technical Staff, Developer, Staff, etc.
  return {
    tier: 'Operational',
    label: 'Operational',
    badgeClass: 'bg-slate-700/50 text-slate-300 border-slate-600/40',
    textClass: 'text-slate-400',
    icon: '⚙️',
  };
}

