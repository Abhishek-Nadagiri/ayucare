'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { User, RoleName } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Add User Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleName, setRoleName] = useState<RoleName>('Doctor');
  const [department, setDepartment] = useState('General Medicine');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data);
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
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: User) => {
    if (currentUser?.roleName !== 'Administrator') {
      alert('Only Administrators can modify user accounts.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          updates: { isActive: !user.isActive },
        }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to toggle user status', err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          roleName,
          department,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || 'Failed to create user');
        setSubmitting(false);
        return;
      }

      setIsAddOpen(false);
      setFullName('');
      setEmail('');
      fetchUsers();
    } catch (err) {
      setError('Network error registering user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const canManageUsers = currentUser?.roleName === 'Administrator';

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-teal-500" />
            Healthcare Staff & User Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Role-based authorization directory and clinician account provisioning.
          </p>
        </div>

        {canManageUsers && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Healthcare Staff
          </Button>
        )}
      </div>

      {/* USERS TABLE */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading user records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Account Status</th>
                    {canManageUsers && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        !u.isActive ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center text-xs">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {u.fullName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {u.roleName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {u.department}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Deactivated
                          </span>
                        )}
                      </td>
                      {canManageUsers && (
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant={u.isActive ? 'outline' : 'success'}
                            onClick={() => handleToggleActive(u)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD USER MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Provision Healthcare Staff Account"
        subtitle="Registers a new user and grants role-based permissions."
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAddUser} className="space-y-4">
          <Input
            label="Full Legal Name"
            required
            placeholder="e.g. Dr. Jennifer Lawrence, MD"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Clinical Email Address"
            type="email"
            required
            placeholder="jennifer@medora.health"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assigned System Role"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value as RoleName)}
              options={[
                { label: 'Doctor (Full Clinical Access)', value: 'Doctor' },
                { label: 'Nurse (Observations & Care)', value: 'Nurse' },
                { label: 'Administrator (System Oversight)', value: 'Administrator' },
                { label: 'Student (Supervised Trainee)', value: 'Student' },
              ]}
            />

            <Select
              label="Medical Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { label: 'Cardiology', value: 'Cardiology' },
                { label: 'Neurology', value: 'Neurology' },
                { label: 'General Medicine', value: 'General Medicine' },
                { label: 'General Surgery', value: 'General Surgery' },
                { label: 'Pulmonology', value: 'Pulmonology' },
                { label: 'Nephrology', value: 'Nephrology' },
                { label: 'Administration', value: 'Administration' },
                { label: 'Inpatient Care', value: 'Inpatient Care' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Provision User
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
