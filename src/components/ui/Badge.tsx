import React from 'react';
import { CasePriority, CaseStatus, FollowupStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'urgent'
    | 'high'
    | 'normal'
    | 'low'
    | 'status'
    | 'success'
    | 'warning'
    | 'danger'
    | 'outline';
  priority?: CasePriority;
  status?: CaseStatus | FollowupStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  children,
  variant = 'default',
  priority,
  status,
  className = '',
  size = 'md',
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-semibold',
    lg: 'text-sm px-3 py-1 font-semibold',
  }[size];

  // Priority-based styling
  if (priority) {
    switch (priority) {
      case 'Urgent':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 ${sizeClasses} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 ${sizeClasses} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            High
          </span>
        );
      case 'Normal':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 ${sizeClasses} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Normal
          </span>
        );
      case 'Low':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30 ${sizeClasses} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Low
          </span>
        );
    }
  }

  // Status-based styling
  if (status) {
    switch (status) {
      case 'New':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 ${sizeClasses} ${className}`}>
            New
          </span>
        );
      case 'Under Review':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 ${sizeClasses} ${className}`}>
            Under Review
          </span>
        );
      case 'Active':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 ${sizeClasses} ${className}`}>
            Active
          </span>
        );
      case 'On Hold':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 ${sizeClasses} ${className}`}>
            On Hold
          </span>
        );
      case 'Follow-up Required':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 ${sizeClasses} ${className}`}>
            Follow-up Required
          </span>
        );
      case 'Resolved':
      case 'Completed':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${sizeClasses} ${className}`}>
            {status}
          </span>
        );
      case 'Closed':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/30 ${sizeClasses} ${className}`}>
            Closed
          </span>
        );
      case 'Scheduled':
      case 'Pending':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 ${sizeClasses} ${className}`}>
            {status}
          </span>
        );
      case 'Cancelled':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30 ${sizeClasses} ${className}`}>
            Cancelled
          </span>
        );
    }
  }

  // Variant-based styling
  const variantStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
    urgent: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
    high: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    normal: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
    low: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30',
    status: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
    outline: 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent',
  }[variant];

  return (
    <span className={`inline-flex items-center rounded-full ${variantStyles} ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
}
