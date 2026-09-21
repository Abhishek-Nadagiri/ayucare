'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AuditLog, User as UserType } from '@/types';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityFilter !== 'ALL') params.set('entityType', entityFilter);
      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.status === 403 || res.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data);
      }
    } catch (err) {
      console.error(err);
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
    fetchLogs();
  }, [entityFilter]);

  if (unauthorized) {
    return (
      <AppShell>
        <div className="p-8 max-w-lg mx-auto text-center space-y-4">
          <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 inline-block">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Administrator Access Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit log inspection is restricted to authorized System Administrators to protect clinical integrity and patient privacy.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-orange-500" />
            System Audit & Access Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable chronological record of patient access, clinical mutations, and user sessions.
          </p>
        </div>

        <div className="w-48">
          <Select
            options={[
              { label: 'All Entity Types', value: 'ALL' },
              { label: 'Cases (CASE)', value: 'CASE' },
              { label: 'Patients (PATIENT)', value: 'PATIENT' },
              { label: 'Notes (NOTE)', value: 'NOTE' },
              { label: 'Follow-ups (FOLLOWUP)', value: 'FOLLOWUP' },
              { label: 'Attachments (ATTACHMENT)', value: 'ATTACHMENT' },
              { label: 'Authentication (AUTH)', value: 'AUTH' },
              { label: 'Users (USER)', value: 'USER' },
            ]}
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          />
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No audit logs match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Metadata Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {log.actorName || 'System'}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {log.actorRole || 'Service'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ''}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {log.metadata ? JSON.stringify(log.metadata) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
