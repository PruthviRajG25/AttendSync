'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast, Card, CardContent, Button, Input, Dialog } from '../../components/ui/core';
import { api } from '../../lib/api';
import { Settings, Moon, Sun, Trash2, Loader2, Save, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Form states
  const [attendanceGoal, setAttendanceGoal] = useState(String(user?.attendanceGoal || '75'));
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    const goalNum = Number(attendanceGoal);
    if (!attendanceGoal || isNaN(goalNum) || goalNum < 0 || goalNum > 100) {
      toast('Please enter a goal percentage between 0 and 100.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.updateProfile({ attendanceGoal: goalNum });
      updateUser(data.user);
      toast('Goal settings updated successfully!', 'success');
    } catch (error) {
      toast(error.message || 'Failed to update goal.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount();
      toast('Your account and records have been deleted.', 'success');
      setDeleteOpen(false);
      logout();
    } catch (error) {
      toast(error.message || 'Failed to delete account.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Settings</h2>
          <p className="text-zinc-500 text-sm mt-0.5">Customize application theme behavior and compliance thresholds</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 1: Themes & Goals */}
          <div className="space-y-6">
            
            {/* Theme Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Theme Preferences</h3>
                  <p className="text-[11px] text-zinc-400">Toggle between Light and Dark interface modes</p>
                </div>
                <div className="flex gap-4">
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
              </CardContent>
            </Card>

            {/* Attendance Goal Card */}
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSaveGoal} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Required Attendance Goal</h3>
                    <p className="text-[11px] text-zinc-400">Set the compliance percent required by your college (typically 75% or 85%)</p>
                  </div>
                  
                  <Input
                    label="Compliance Percentage Goal (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={attendanceGoal}
                    onChange={(e) => setAttendanceGoal(e.target.value)}
                  />

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" className="flex items-center gap-2" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Threshold
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

          </div>

          {/* Section 2: Danger Zone */}
          <div>
            <Card className="border-red-500/20 bg-red-500/5 hover:shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-sm font-bold">Danger Zone</h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                  Permanently delete your account and clear all subjects, schedules, and attendance logs. This action is absolute and cannot be recovered.
                </p>
                <div className="pt-2">
                  <Button onClick={() => setDeleteOpen(true)} variant="danger" className="flex items-center gap-2 text-xs font-semibold px-4 py-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* --- Dialog: Delete Account Confirmation --- */}
        <Dialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Permanently Delete Account">
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
              Are you absolutely sure you want to delete your AttendSync account? All of your lecture timetables, historical logs, and custom goals will be permanently erased.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Account Deletion'}
              </Button>
            </div>
          </div>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
