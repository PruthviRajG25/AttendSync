'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast, Card, CardContent, Button, Input } from '../../components/ui/core';
import { api } from '../../lib/api';
import { User, Loader2, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [semester, setSemester] = useState(String(user?.semester || '1'));
  const [branch, setBranch] = useState(user?.branch || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Full name is required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.updateProfile({
        name,
        college,
        semester: Number(semester),
        branch,
      });
      updateUser(data.user);
      toast('Profile updated successfully!', 'success');
    } catch (error) {
      toast(error.message || 'Failed to update profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Student Profile</h2>
          <p className="text-zinc-500 text-sm mt-0.5">Manage your academic and institutional details</p>
        </div>

        <Card className="max-w-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/80">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="flex items-center gap-4 pb-6 border-b border-zinc-50 dark:border-zinc-900/50">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-xl">
                  {name ? name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{name || 'Student Name'}</h3>
                  <p className="text-[11px] text-zinc-400 font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="College Name"
                  placeholder="e.g. Stanford University"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Current Semester"
                  type="number"
                  min="1"
                  max="12"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
                <Input
                  label="Department / Branch"
                  placeholder="e.g. Computer Science"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" variant="primary" className="flex items-center gap-2" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
