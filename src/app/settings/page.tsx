'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Lock,
  Database,
  Moon,
  Sun,
  AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User as UserType, PermissionName } from '@/types';
import { ROLE_DEFINITIONS } from '@/lib/auth/rbac';

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [permissions, setPermissions] = useState<PermissionName[]>([]);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const json = await res.json();
          setCurrentUser(json.data.user);
          setPermissions(json.data.permissions);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadUser();
  }, []);

  const handleResetSeed = async () => {
    if (!confirm('This will restore all sample patients, cases, and timelines to their initial clean demo state. Proceed?')) {
      return;
    }

    setResetting(true);
    setResetSuccess(false);
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-500" />
          System Settings & User Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Review active authorization permissions, session parameters, and demo data controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* User Profile Card */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Active Healthcare Profile
              </CardTitle>
              <CardDescription>Authenticated clinician session details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-lg">
                  {currentUser?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {currentUser?.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{currentUser?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-slate-400 text-xs">Role Classification</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {currentUser?.roleName}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Assigned Department</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {currentUser?.department}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-500" />
                Demo Database Controls
              </CardTitle>
              <CardDescription>
                Restore sample data scenarios to initial clean state
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                If you have modified patient records, transitioned cases, or completed follow-ups and would like to restore the initial curated clinical dataset (Cardiology, Neurology, Emergency cases), click below:
              </p>

              {resetSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Database successfully re-seeded with realistic clinical dataset!
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSeed}
                isLoading={resetting}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset Database to Clean Demo State
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Permissions & Security Overview */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Role-Based Permissions Matrix (TRD Section 18)
              </CardTitle>
              <CardDescription>
                Verified capabilities granted to <strong>{currentUser?.roleName}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'patient:read',
                  'patient:create',
                  'patient:update',
                  'patient:archive',
                  'case:read',
                  'case:create',
                  'case:update',
                  'case:assign',
                  'case:status_update',
                  'note:read',
                  'note:create',
                  'followup:read',
                  'followup:create',
                  'followup:update',
                  'report:read',
                  'report:export',
                  'user:manage',
                  'audit:read',
                ].map((perm) => {
                  const has = permissions.includes(perm as PermissionName);
                  return (
                    <div
                      key={perm}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        has
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300 font-medium'
                          : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="font-mono">{perm}</span>
                      {has ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Blocked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Security & Compliance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-500" />
                Data Protection & Privacy Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <p>• <strong>Strict Server-Side Validation:</strong> Client-side permission checks are mirrored and authoritative server-side.</p>
              <p>• <strong>Auditability:</strong> Every patient creation, status change, and clinical amendment records an immutable audit log with actor and timestamp.</p>
              <p>• <strong>Separation of Data:</strong> Demo simulated cases and clinical documentation are isolated from production databases.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
