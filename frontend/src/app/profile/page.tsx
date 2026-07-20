'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, useToast, Button, Input } from '../../components/ui/core';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { User, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    semester: user?.semester || 1,
    branch: user?.branch || '',
    attendanceGoal: user?.attendanceGoal || 75
  });
  
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'semester' || name === 'attendanceGoal' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast('Student Name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const data = await api.updateProfile(formData);
      updateUser(data.user);
      toast('Profile updated successfully!', 'success');
    } catch (error: any) {
      toast(error.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Student Profile</h2>
          <p className="text-sm text-zinc-500">Manage your university seat details, college brand, and target goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Left Column Profile info summary */}
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{user?.name}</h3>
                <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
              </div>
              {user?.college && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-xs text-zinc-500 leading-relaxed">
                  Attends <strong>{user.college}</strong>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column Edit Form */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <h3 className="text-md font-bold flex items-center gap-2 border-b border-zinc-50 dark:border-zinc-900 pb-3">
                  <User className="w-4.5 h-4.5 text-blue-500" />
                  Academic Profile Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="College / University"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Semester"
                    name="semester"
                    type="number"
                    min={1}
                    max={12}
                    value={formData.semester}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Branch / Major"
                    name="branch"
                    placeholder="e.g. Computer Science"
                    value={formData.branch}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Target Goal (%)"
                    name="attendanceGoal"
                    type="number"
                    min={50}
                    max={100}
                    value={formData.attendanceGoal}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="px-6 py-2.5 rounded-xl" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving changes...
                      </>
                    ) : (
                      'Save Credentials'
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>

        </div>

      </div>
    </DashboardLayout>
  );
}
