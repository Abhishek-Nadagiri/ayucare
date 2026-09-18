'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Users,
  FolderHeart,
  CalendarClock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  Building2,
  Filter,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardStats, PatientCase, CaseFollowup, AuditLog } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCases, setRecentCases] = useState<PatientCase[]>([]);
  const [urgentFollowups, setUrgentFollowups] = useState<CaseFollowup[]>([]);
  const [recentEvents, setRecentEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard/statistics');
      if (res.ok) {
        const json = await res.json();
        setStats(json.data.stats);
        setRecentCases(json.data.recentCases);
        setUrgentFollowups(json.data.urgentFollowups);
        setRecentEvents(json.data.recentEvents);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AppShell>
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Clinical Monitoring Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time overview of active cases, upcoming patient follow-ups, and workload alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/patients">
            <Button size="sm" variant="outline" leftIcon={<Users className="w-3.5 h-3.5" />}>
              Patient Directory
            </Button>
          </Link>
          <Link href="/cases/new">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Create Case
            </Button>
          </Link>
        </div>
      </div>

      {/* OVERDUE ALERT BANNER (If overdue follow-ups exist) */}
      {stats && stats.overdueFollowups > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-500">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Action Required: {stats.overdueFollowups} Overdue Patient Follow-Up{stats.overdueFollowups > 1 ? 's' : ''}
              </h2>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                Past-due evaluations require clinical review or completion documentation.
              </p>
            </div>
          </div>
          <Link href="/followups?timeframe=OVERDUE">
            <Button size="sm" variant="danger">
              Review Overdue Tasks
            </Button>
          </Link>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Cases */}
        <Card className="hover:border-teal-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Cases
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? '...' : stats?.activeCases ?? 0}
              </h3>
              <p className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>{stats?.newCasesThisWeek ?? 0} new this week</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FolderHeart className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Patients */}
        <Card className="hover:border-sky-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Patients
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? '...' : stats?.totalPatients ?? 0}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Under hospital care
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Follow-ups Required */}
        <Card className="hover:border-amber-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Follow-ups Scheduled
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? '...' : stats?.followupsRequired ?? 0}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                Active care milestones
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CalendarClock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Overdue Follow-ups */}
        <Card className="hover:border-rose-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Overdue Actions
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {loading ? '...' : stats?.overdueFollowups ?? 0}
              </h3>
              <p className="text-xs text-rose-500 mt-1 font-medium">
                Requires clinical closure
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRIORITY & STATUS BREAKDOWN GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases by Priority */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Case Priority Distribution</CardTitle>
            <CardDescription>Clinical urgency of all monitored cases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats && (
              <>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Urgent Priority
                  </div>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {stats.casesByPriority.urgent}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    High Priority
                  </div>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {stats.casesByPriority.high}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Normal Priority
                  </div>
                  <span className="text-sm font-bold text-sky-600 dark:text-sky-400 font-mono">
                    {stats.casesByPriority.normal}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Low Priority
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 font-mono">
                    {stats.casesByPriority.low}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Department Load Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              <Building2 className="w-4 h-4 text-teal-500" />
              Department Workload
            </CardTitle>
            <CardDescription>Active patient cases categorized by department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {stats &&
              Object.entries(stats.departmentLoad).map(([dept, count]) => (
                <div
                  key={dept}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800"
                >
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {dept}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
                      {count} {count === 1 ? 'case' : 'cases'}
                    </span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Case Status Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Case Status Overview</CardTitle>
            <CardDescription>Current lifecycle state of all cases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats &&
              Object.entries(stats.casesByStatus).map(([status, count]) => {
                if (count === 0) return null;
                return (
                  <div
                    key={status}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800"
                  >
                    <Badge status={status as any} size="sm">
                      {status}
                    </Badge>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {count}
                    </span>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      {/* TWO COLUMN WORKLOAD: RECENT CASES & URGENT FOLLOW-UPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recently Updated Cases */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recently Updated Cases</CardTitle>
                <CardDescription>Most recent case developments and admissions</CardDescription>
              </div>
              <Link href="/cases">
                <Button size="sm" variant="ghost" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentCases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors block"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                          {c.caseNumber}
                        </span>
                        <Badge priority={c.priority} size="sm">
                          {c.priority}
                        </Badge>
                        <Badge status={c.status} size="sm">
                          {c.status}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Patient: {(c as any).patientName || 'Patient'}</span>
                        <span>•</span>
                        <span>{c.department}</span>
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Urgent & Overdue Follow-ups */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Overdue Follow-ups
                </CardTitle>
                <CardDescription>Patients requiring immediate milestone review</CardDescription>
              </div>
              <Link href="/followups">
                <Button size="sm" variant="ghost" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  Manage
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {urgentFollowups.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span>No overdue follow-ups! All milestones are on track.</span>
                  </div>
                ) : (
                  urgentFollowups.map((f) => (
                    <div key={f.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          Due: {f.followupDate}
                        </span>
                        <Link href={`/cases/${f.caseId}`}>
                          <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                            {f.caseNumber}
                          </span>
                        </Link>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {f.purpose}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Patient: <strong className="text-slate-700 dark:text-slate-300">{f.patientName}</strong> • Assigned: {f.assignedToName}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity / Audit Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-500" />
                Live Clinical Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto">
                {recentEvents.map((e) => (
                  <div key={e.id} className="p-3 text-xs flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {e.actorName || 'Clinical Staff'}{' '}
                        <span className="font-normal text-slate-500 dark:text-slate-400">
                          {e.action.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(e.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
