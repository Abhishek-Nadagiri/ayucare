'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CalendarClock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  ArrowUpRight,
  User,
  Calendar,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { CaseFollowup, User as UserType } from '@/types';

function FollowupsContent() {
  const searchParams = useSearchParams();
  const initialTimeframe = (searchParams.get('timeframe') as any) || 'ALL';

  const [activeTab, setActiveTab] = useState(initialTimeframe);
  const [followups, setFollowups] = useState<CaseFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Complete Followup Modal
  const [completingFollowup, setCompletingFollowup] = useState<CaseFollowup | null>(null);
  const [outcome, setOutcome] = useState('');
  const [submittingOutcome, setSubmittingOutcome] = useState(false);

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'ALL') {
        params.set('timeframe', activeTab);
      }
      const res = await fetch(`/api/followups?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setFollowups(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch followups', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setCurrentUser(json.data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchFollowups();
  }, [activeTab]);

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingFollowup) return;
    setSubmittingOutcome(true);
    try {
      const res = await fetch(`/api/followups/${completingFollowup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          outcome: outcome.trim() || 'Follow-up evaluated and documented successfully.',
        }),
      });
      if (res.ok) {
        setCompletingFollowup(null);
        setOutcome('');
        await fetchFollowups();
      }
    } catch (err) {
      console.error('Failed to complete follow-up', err);
    } finally {
      setSubmittingOutcome(false);
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Follow-ups' },
    { id: 'OVERDUE', label: 'Overdue Milestones', icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'TODAY', label: 'Due Today', icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'UPCOMING', label: 'Upcoming', icon: <Calendar className="w-3.5 h-3.5 text-teal-500" /> },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-teal-500" />
            Patient Follow-up Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track clinical milestones, review overdue tasks, and record care outcomes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* LIST OF FOLLOWUPS */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center text-xs text-slate-400">
              Loading follow-up schedule...
            </CardContent>
          </Card>
        ) : followups.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-xs text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No follow-ups found in this category.
              </p>
            </CardContent>
          </Card>
        ) : (
          followups.map((f) => {
            const isOverdue =
              f.status !== 'Completed' &&
              f.status !== 'Cancelled' &&
              f.followupDate < new Date().toISOString().split('T')[0];

            return (
              <Card
                key={f.id}
                className={isOverdue ? 'border-rose-500/40 bg-rose-500/5' : ''}
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                        Due: {f.followupDate}
                      </span>
                      <Badge status={f.status} size="sm">
                        {f.status}
                      </Badge>
                      {isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Overdue Action
                        </span>
                      )}
                      <Link
                        href={`/cases/${f.caseId}`}
                        className="font-mono text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline ml-1"
                      >
                        {f.caseNumber}
                      </Link>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {f.purpose}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Patient:{' '}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {f.patientName}
                      </strong>{' '}
                      • Case: {f.caseTitle} • Assigned Clinician: {f.assignedToName}
                    </p>

                    {f.outcome && (
                      <div className="mt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
                        <strong>Documented Clinical Outcome:</strong> {f.outcome}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/cases/${f.caseId}?tab=followups`}>
                      <Button size="sm" variant="outline" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                        Case Details
                      </Button>
                    </Link>

                    {f.status !== 'Completed' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          setCompletingFollowup(f);
                        }}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* COMPLETION MODAL */}
      <Modal
        isOpen={Boolean(completingFollowup)}
        onClose={() => setCompletingFollowup(null)}
        title="Complete Clinical Follow-Up"
        subtitle={`Milestone for ${completingFollowup?.patientName} (${completingFollowup?.caseNumber})`}
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <strong>Follow-Up Purpose:</strong> {completingFollowup?.purpose}
          </div>

          <Textarea
            label="Clinical Outcome & Notes"
            required
            rows={4}
            placeholder="Record exam results, patient status, medication adjustments, or next steps..."
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCompletingFollowup(null)}
              disabled={submittingOutcome}
            >
              Cancel
            </Button>
            <Button type="submit" variant="success" isLoading={submittingOutcome}>
              Record Outcome & Mark Completed
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default function FollowupsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading follow-ups...</div>}>
        <FollowupsContent />
      </Suspense>
    </AppShell>
  );
}
