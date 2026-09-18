'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  CheckCircle2,
  Users,
  FolderHeart,
  CalendarClock,
  Building2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardStats } from '@/types';

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/dashboard/statistics');
        if (res.ok) {
          const json = await res.json();
          setStats(json.data.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleExportCSV = () => {
    window.location.href = '/api/reports/cases?format=csv';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell>
      {/* Header with Export buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-500" />
            Clinical Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical monitoring, case distributions, and authorized CSV reporting exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Summary
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleExportCSV}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
          >
            Export Cases (CSV)
          </Button>
        </div>
      </div>

      {/* STATISTICAL SUMMARY TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Active Patients Monitored
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats?.totalPatients ?? 0}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Active Episodes of Care
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats?.activeCases ?? 0}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <FolderHeart className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Follow-up Adherence
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats
                  ? `${Math.round(
                      (1 - stats.overdueFollowups / Math.max(stats.followupsRequired, 1)) * 100
                    )}%`
                  : '100%'}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DEPARTMENTAL LOAD CHART & CASE MATRICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Departmental Case Allocation</CardTitle>
            <CardDescription>Distribution of clinical episodes by medical specialty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats &&
              Object.entries(stats.departmentLoad).map(([dept, count]) => {
                const total = Math.max(stats.activeCases, 1);
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{dept}</span>
                      <span className="text-slate-500 font-mono">
                        {count} cases ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* Priority Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Acuity & Priority Stratification</CardTitle>
            <CardDescription>Clinical urgency triage breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats && (
              <>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        Urgent Acuity Cases
                      </p>
                      <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                        Immediate clinician attention required
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {stats.casesByPriority.urgent}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        High Priority Cases
                      </p>
                      <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
                        Active surveillance within 24 hours
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                    {stats.casesByPriority.high}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <div>
                      <p className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        Normal Priority Cases
                      </p>
                      <p className="text-[11px] text-sky-600/80 dark:text-sky-400/80">
                        Standard inpatient and outpatient care
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400">
                    {stats.casesByPriority.normal}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
