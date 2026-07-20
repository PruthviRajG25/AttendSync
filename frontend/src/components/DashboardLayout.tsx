'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/core';
import { api } from '../lib/api';
import {
  LayoutDashboard,
  BookOpen,
  Calculator,
  Calendar,
  CalendarDays,
  TrendingUp,
  ClipboardList,
  FileSpreadsheet,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Database,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Authentication route guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-zinc-500">Checking credentials...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Calculator', path: '/calculator', icon: Calculator },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Timetable', path: '/timetable', icon: CalendarDays },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Study Planner', path: '/planner', icon: ClipboardList },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.seedMockData();
      toast('Mock data successfully seeded!', 'success');
      // Refresh current page
      window.location.reload();
    } catch (error: any) {
      toast(error.message || 'Failed to seed data.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950/80 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-zinc-50 dark:border-zinc-900/50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.png" alt="AttendSync Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              AttendSync
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-50 dark:border-zinc-900/50 space-y-2">
          {/* Seeder Button */}
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex w-full items-center justify-center gap-2 px-3 py-2 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            {seeding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Database className="w-3.5 h-3.5" />
            )}
            Seed Demo Data
          </button>

          {/* Theme & Logout */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 p-2 px-3 rounded-lg text-red-500 hover:bg-red-500/5 transition-colors text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            {/* Hamburger for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg md:hidden text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
              {menuItems.find((item) => item.path === pathname)?.name || 'App'}
            </h1>
          </div>

          {/* Student Quick Stats (Goal) */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-zinc-400">Student Profile</span>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {user?.name} {user?.semester ? `(Sem ${user.semester})` : ''}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8 bg-zinc-50/50 dark:bg-black/50">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Menu */}
          <div className="relative w-64 max-w-xs bg-white dark:bg-zinc-950 flex flex-col h-full p-6 shadow-xl border-r border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center justify-between mb-8">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <img src="/logo.png" alt="AttendSync Logo" className="w-8 h-8 rounded-lg object-contain" />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  AttendSync
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-zinc-50 dark:border-zinc-900/50 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSeed();
                }}
                disabled={seeding}
                className="flex w-full items-center justify-center gap-2 px-3 py-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-blue-500 transition-colors"
              >
                <Database className="w-3.5 h-3.5" />
                Seed Demo Data
              </button>
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-1.5 p-2 px-3 rounded-lg text-red-500 hover:bg-red-500/5 transition-colors text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (For mobile first experience) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 md:hidden bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-around px-2 z-40">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-lg transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium tracking-tight">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
      
    </div>
  );
};
