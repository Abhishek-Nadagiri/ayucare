'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Users,
  FolderHeart,
  CalendarClock,
  BarChart3,
  ShieldCheck,
  UserCog,
  Settings,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Plus,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { User, Notification, RoleName } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Load current user and notifications
  const loadUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setCurrentUser(json.data.user);
      }
    } catch (err) {
      console.error('Failed to load user', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data.notifications);
        setUnreadCount(json.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    loadUserData();
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleSwitch = async (roleName: RoleName) => {
    setShowRoleMenu(false);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName }),
      });
      if (res.ok) {
        await loadUserData();
        await loadNotifications();
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
      }
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { href: '/patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
    { href: '/cases', label: 'Cases', icon: <FolderHeart className="w-4 h-4" /> },
    { href: '/followups', label: 'Follow-ups', icon: <CalendarClock className="w-4 h-4" /> },
    { href: '/reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Admin exclusive navigation items
  if (currentUser?.roleName === 'Administrator') {
    navItems.push(
      { href: '/audit', label: 'Audit Logs', icon: <ShieldCheck className="w-4 h-4" /> },
      { href: '/users', label: 'User Directory', icon: <UserCog className="w-4 h-4" /> }
    );
  }

  navItems.push({ href: '/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0b101b]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800/80 flex-shrink-0 z-20">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/25 ring-1 ring-orange-400/30">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
              AYUCARE
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-600 dark:text-orange-400 font-semibold tracking-widest uppercase border border-orange-500/30">
                Care
              </span>
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Case Monitoring System
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold shadow-sm shadow-orange-500/5'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className={isActive ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Active Role Status */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-orange-600/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {currentUser?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                    {currentUser?.fullName || 'Sarah Chen, MD'}
                  </p>
                  <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {currentUser?.roleName || 'Doctor'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 animate-slide-down">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role (RBAC Demo)
                </div>
                <button
                  onClick={() => handleRoleSwitch('Doctor')}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Dr. Sarah Chen</div>
                    <div className="text-[10px] text-slate-400">Doctor (Clinical Lead)</div>
                  </div>
                  {currentUser?.roleName === 'Doctor' && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </button>
                <button
                  onClick={() => handleRoleSwitch('Nurse')}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">James Rodriguez, RN</div>
                    <div className="text-[10px] text-slate-400">Nurse (Observations / Care)</div>
                  </div>
                  {currentUser?.roleName === 'Nurse' && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </button>
                <button
                  onClick={() => handleRoleSwitch('Administrator')}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Elena Rostova</div>
                    <div className="text-[10px] text-slate-400">Admin (Audit & Users)</div>
                  </div>
                  {currentUser?.roleName === 'Administrator' && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </button>
                <button
                  onClick={() => handleRoleSwitch('Student')}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Alex Kim</div>
                    <div className="text-[10px] text-slate-400">Student (Trainee View)</div>
                  </div>
                  {currentUser?.roleName === 'Student' && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 mt-1.5 pt-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white dark:bg-[#0f172a] h-full flex flex-col z-10 border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 text-white shadow-sm">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <span className="font-bold tracking-tight text-slate-900 dark:text-white">AYUCARE</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-orange-500/15 text-orange-500 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 p-2 rounded-lg"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Action Button */}
            {currentUser?.roleName === 'Doctor' && (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/cases/new">
                  <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    New Case
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Header Actions: Role indicator, notifications, theme toggle */}
          <div className="flex items-center gap-3">
            {/* Active Role Chip with Click to Switch */}
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-all text-xs font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="text-slate-600 dark:text-slate-400">Role:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {currentUser?.roleName || 'Doctor'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle color theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No notifications currently.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                            !n.readAt ? 'bg-orange-500/5 dark:bg-orange-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {n.type === 'FOLLOWUP_OVERDUE' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                            ) : n.type === 'FOLLOWUP_UPCOMING' ? (
                              <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Activity className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                  {n.title}
                                </p>
                                {!n.readAt && (
                                  <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                              {n.relatedCaseId && (
                                <Link
                                  href={`/cases/${n.relatedCaseId}`}
                                  onClick={() => setShowNotifications(false)}
                                  className="inline-block text-[11px] text-orange-600 dark:text-orange-400 font-medium hover:underline mt-1"
                                >
                                  View Related Case →
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
