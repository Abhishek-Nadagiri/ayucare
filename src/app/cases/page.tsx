'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderHeart,
  Search,
  Plus,
  Filter,
  ArrowUpRight,
  Clock,
  User,
  Building2,
  Calendar,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PatientCase, User as UserType } from '@/types';

export default function CasesPage() {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
      if (departmentFilter !== 'ALL') params.set('department', departmentFilter);

      const res = await fetch(`/api/cases?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setCases(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch cases', err);
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
    const timer = setTimeout(() => {
      fetchCases();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, priorityFilter, departmentFilter]);

  const canCreateCase = currentUser?.roleName === 'Doctor';

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-orange-500" />
            Clinical Cases Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor, track, and document active clinical episodes across medical departments.
          </p>
        </div>

        {canCreateCase && (
          <Link href="/cases/new">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Create New Case
            </Button>
          </Link>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-72">
          <Input
            placeholder="Search by case #, title, or complaint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-2.5">
          <div className="w-36">
            <Select
              options={[
                { label: 'All Statuses', value: 'ALL' },
                { label: 'New', value: 'New' },
                { label: 'Under Review', value: 'Under Review' },
                { label: 'Active', value: 'Active' },
                { label: 'On Hold', value: 'On Hold' },
                { label: 'Follow-up Required', value: 'Follow-up Required' },
                { label: 'Resolved', value: 'Resolved' },
                { label: 'Closed', value: 'Closed' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          <div className="w-32">
            <Select
              options={[
                { label: 'All Priorities', value: 'ALL' },
                { label: 'Urgent', value: 'Urgent' },
                { label: 'High', value: 'High' },
                { label: 'Normal', value: 'Normal' },
                { label: 'Low', value: 'Low' },
              ]}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            />
          </div>

          <div className="w-36">
            <Select
              options={[
                { label: 'All Departments', value: 'ALL' },
                { label: 'Cardiology', value: 'Cardiology' },
                { label: 'Neurology', value: 'Neurology' },
                { label: 'General Medicine', value: 'General Medicine' },
                { label: 'General Surgery', value: 'General Surgery' },
                { label: 'Pulmonology', value: 'Pulmonology' },
                { label: 'Nephrology', value: 'Nephrology' },
                { label: 'Endocrinology', value: 'Endocrinology' },
              ]}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* CASES TABLE */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading clinical cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <FolderHeart className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No cases match the selected filters.
              </p>
              <p>Adjust the search criteria or open a new clinical case.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Case #</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Case Title & Consultation Reason</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Responsible Clinician</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {cases.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-orange-600 dark:text-orange-400">
                        {c.caseNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge priority={c.priority} size="sm">
                          {c.priority}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={c.status} size="sm">
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          href={`/cases/${c.id}`}
                          className="font-semibold text-slate-900 dark:text-white hover:underline block truncate"
                        >
                          {c.title}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {c.consultationReason}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <Link
                          href={`/patients/${c.patientId}`}
                          className="hover:underline text-orange-600 dark:text-orange-400 font-semibold"
                        >
                          {(c as any).patientName || 'Patient'}
                        </Link>
                        <p className="font-mono text-[10px] text-slate-400">
                          {(c as any).patientIdentifier}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {c.department}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                        {(c as any).responsibleUserName || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/cases/${c.id}`}>
                          <Button size="sm" variant="ghost" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                            Workspace
                          </Button>
                        </Link>
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
