'use client';

import React from 'react';
import { getRankRole, cn, RankRoleTier } from '@/lib/utils';

interface RankRoleBadgeProps {
  rank: string | undefined | null;
  genNo?: string | number | null;
  showRoleTag?: boolean;
  showRankText?: boolean;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export function RankRoleBadge({
  rank,
  genNo,
  showRoleTag = true,
  showRankText = true,
  className,
  size = 'xs'
}: RankRoleBadgeProps) {
  const roleMeta = getRankRole(rank);
  const displayRank = rank || 'Staff';

  return (
    <div className={cn("inline-flex items-center gap-1.5 flex-wrap", className)}>
      {showRankText && (
        <span className="font-semibold text-slate-200">
          {displayRank}
          {genNo ? <span className="text-slate-400 font-normal text-[11px]"> ({genNo})</span> : ''}
        </span>
      )}

      {showRoleTag && (
        <span 
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold tracking-wide border uppercase text-[10px] whitespace-nowrap",
            roleMeta.badgeClass,
            size === 'sm' && "text-[11px] px-2.5 py-0.5",
            size === 'md' && "text-xs px-3 py-1"
          )}
          title={`${displayRank} carries ${roleMeta.label} responsibilities`}
        >
          <span>{roleMeta.icon}</span>
          <span>{roleMeta.label}</span>
        </span>
      )}
    </div>
  );
}

export function RoleTagOnlyBadge({
  tier,
  size = 'xs'
}: {
  tier: RankRoleTier | string;
  size?: 'xs' | 'sm' | 'md';
}) {
  const roleMeta = getRankRole(tier);

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold tracking-wide border uppercase text-[10px] whitespace-nowrap",
        roleMeta.badgeClass,
        size === 'sm' && "text-[11px] px-2.5 py-0.5",
        size === 'md' && "text-xs px-3 py-1"
      )}
    >
      <span>{roleMeta.icon}</span>
      <span>{roleMeta.label}</span>
    </span>
  );
}

export default RankRoleBadge;
