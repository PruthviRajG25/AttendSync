'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, useToast, Button, Select, Input } from '../../components/ui/core';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/api';
import {
  Settings,
  Trash2,
  Download,
  AlertTriangle,
  Loader2,
  Moon,
  Sun
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [minGoal, setMinGoal] = useState<number>(user?.attendanceGoal || 75);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.updateProfile({ attendanceGoal: minGoal });
      updateUser(data.user);
      toast('Minimum attendance target updated!', 'success');
    } catch (error: any) {
      toast(error.message || 'Failed to update goal.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const subjects = await api.getSubjects();
      const logs = await api.getLogs();
      
      const exportBlob = new Blob(
        [JSON.stringify({ profile: user, subjects, logs }, null, 2)],
        { type: 'application/json' }
      );
      
      const url = URL.createObjectURL(exportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendsync_backup_${user?.name?.toLowerCase().replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast('Backup exported successfully!', 'success');
    } catch (error: any) {
      toast(error.message || 'Failed to export backup.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = confirm(
      'WARNING: This action is permanent! Your account and all associated subjects, attendance logs, timetables, and planner items will be deleted forever. Do you wish to proceed?'
    );
    if (!confirmation) return;

    setDeleting(true);
    try {
      await api.deleteAccount();
      toast('Your account was successfully deleted.', 'success');
      logout();
    } catch (error: any) {
      toast(error.message || 'Failed to delete account.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Settings</h2>
          <p className="text-sm text-zinc-500">Configure global configurations, visual styling, and backups.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Left panel general settings */}
          <div className="space-y-6">
            
            {/* Target Attendance Card */}
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSaveGoal} className="space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 border-b border-zinc-50 dark:border-zinc-900 pb-3">
                    <Settings className="w-4 h-4 text-blue-500" />
                    Global Target Attendance
                  </h3>
                  <Input
                    label="Minimum Attendance Rate (%)"
                    type="number"
                    min={50}
                    max={100}
                    value={minGoal}
                    onChange={(e) => setMinGoal(Number(e.target.value))}
                  />
                  <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={saving} className="py-2 px-5 rounded-xl text-xs font-semibold">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Attendance Goal'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Appearance selection */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2 border-b border-zinc-50 dark:border-zinc-900 pb-3">
                  Appearance Styling
                </h3>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Select Interface Theme</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        theme === 'light'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-50'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        theme === 'dark'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-50'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      Dark
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right panel dangerous settings */}
          <div className="space-y-6">
            
            {/* Export data */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-bold border-b border-zinc-50 dark:border-zinc-900 pb-3">
                  Export Data Backups
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Download a JSON file containing all subjects, attendance logs, and planner milestones for backups or migration.
                </p>
                <div className="pt-2">
                  <Button onClick={handleExportData} variant="secondary" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl">
                    <Download className="w-4 h-4" />
                    Export Backup Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-red-600 dark:text-red-400 border-b border-red-500/10 pb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  Danger Zone
                </h3>
                <p className="text-xs text-red-500 leading-relaxed">
                  Permanently delete your account. This is irreversible. All attendance data, timetable, and deadlines will be erased.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={handleDeleteAccount}
                    variant="danger"
                    disabled={deleting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete My Account
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
