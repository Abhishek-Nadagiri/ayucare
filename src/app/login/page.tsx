'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (loginEmail: string, loginPass?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPass || 'Ayucare2026!',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Login failed. Please check credentials.');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Network error connecting to authentication service.');
      setIsLoading(false);
    }
  };

  const personas = [
    {
      name: 'Dr. Sarah Chen, MD',
      role: 'Doctor',
      email: 'dr.sarah@ayucare.health',
      department: 'Cardiology Lead',
      description: 'Full case creation, documentation, status transitions, follow-up management.',
      icon: <Stethoscope className="w-5 h-5 text-orange-500" />,
      badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    },
    {
      name: 'James Rodriguez, RN',
      role: 'Nurse',
      email: 'nurse.james@ayucare.health',
      department: 'Inpatient Care',
      description: 'Patient observations, nursing care notes, assigned follow-up completions.',
      icon: <HeartPulse className="w-5 h-5 text-amber-500" />,
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    {
      name: 'Elena Rostova',
      role: 'Administrator',
      email: 'admin.elena@ayucare.health',
      department: 'Hospital Administration',
      description: 'Full system audit logs, user management, role policies, and patient archival.',
      icon: <ShieldCheck className="w-5 h-5 text-orange-400" />,
      badgeColor: 'bg-orange-600/15 text-orange-300 border-orange-600/30',
    },
    {
      name: 'Alex Kim',
      role: 'Student',
      email: 'student.alex@ayucare.health',
      department: 'Medical Education',
      description: 'Educational access, simulated cases observation, and training notes.',
      icon: <GraduationCap className="w-5 h-5 text-amber-400" />,
      badgeColor: 'bg-amber-600/15 text-amber-300 border-amber-600/30',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient warm orange background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-white shadow-xl shadow-orange-500/25 mb-4 ring-1 ring-orange-400/40">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          AYUCARE
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-widest">
            Care
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Patient Case Monitoring and Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Standard Login Form */}
        <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">Account Sign-In</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter your authorized healthcare credentials
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(email, password);
            }}
            className="space-y-4"
          >
            <div>
              <Input
                label="Clinical Email Address"
                type="email"
                placeholder="clinician@ayucare.health"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Ayucare
            </Button>
          </form>

          {/* Legal / Clinical Disclaimer */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
            <Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <span>
              For authorized clinical monitoring only. Ayucare does not replace professional clinical judgment.
            </span>
          </div>
        </div>

        {/* Right Column: 1-Click Demo Personas (PRD Role Showcase) */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-orange-400" />
                Quick Role Demonstration
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any persona below to test role-based access control (RBAC):
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {personas.map((p) => (
              <button
                key={p.role}
                onClick={() => handleLogin(p.email)}
                disabled={isLoading}
                className="text-left p-4 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-500/50 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {p.icon}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}
                  >
                    {p.role}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                  {p.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mb-1.5">{p.department}</p>
                <p className="text-[11px] text-slate-500 leading-snug">{p.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-orange-950/30 border border-orange-800/40 text-xs text-orange-300/80 flex items-center justify-between">
            <span>✨ All demo accounts pre-seeded with rich clinical cases.</span>
            <span className="text-[11px] text-orange-400 font-mono">PWD: Ayucare2026!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
