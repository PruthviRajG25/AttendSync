'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, useToast, Button, Input, Dialog, Select } from '../../components/ui/core';
import { api } from '../../lib/api';
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  TrendingUp,
  Loader2,
  AlertCircle,
  User,
  GraduationCap
} from 'lucide-react';

const COLORS = [
  { label: 'Blue', value: '#2563EB' },
  { label: 'Green', value: '#16A34A' },
  { label: 'Yellow', value: '#F59E0B' },
  { label: 'Red', value: '#DC2626' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Cyan', value: '#06B6D4' }
];

export default function SubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    subjectName: '',
    facultyName: '',
    attendedClasses: 0,
    totalClasses: 0,
    minimumAttendance: 75,
    color: '#2563EB'
  });

  const fetchSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (error: any) {
      toast(error.message || 'Error fetching subjects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'attendedClasses' || name === 'totalClasses' || name === 'minimumAttendance'
        ? Number(value)
        : value
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      subjectName: '',
      facultyName: '',
      attendedClasses: 0,
      totalClasses: 0,
      minimumAttendance: 75,
      color: '#2563EB'
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (sub: any) => {
    setSelectedSubject(sub);
    setFormData({
      subjectName: sub.subjectName,
      facultyName: sub.facultyName || '',
      attendedClasses: sub.attendedClasses,
      totalClasses: sub.totalClasses,
      minimumAttendance: sub.minimumAttendance,
      color: sub.color
    });
    setIsEditOpen(true);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectName) {
      toast('Subject Name is required.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await api.createSubject(formData);
      toast('Subject created successfully!', 'success');
      setIsAddOpen(false);
      fetchSubjects();
    } catch (error: any) {
      toast(error.message || 'Failed to create subject.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setActionLoading(true);
    try {
      await api.updateSubject(selectedSubject.id, formData);
      toast('Subject updated successfully!', 'success');
      setIsEditOpen(false);
      fetchSubjects();
    } catch (error: any) {
      toast(error.message || 'Failed to update subject.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject? All logs and schedules associated with it will be permanently deleted.')) {
      return;
    }
    try {
      await api.deleteSubject(id);
      toast('Subject deleted successfully!', 'success');
      fetchSubjects();
    } catch (error: any) {
      toast(error.message || 'Failed to delete subject.', 'error');
    }
  };

  const handleQuickLog = async (subjectId: string, status: 'present' | 'absent') => {
    try {
      await api.quickUpdateLog({ subjectId, status });
      toast(`Logged class as ${status === 'present' ? 'Present' : 'Absent'}!`, 'success');
      fetchSubjects();
    } catch (error: any) {
      toast(error.message || 'Failed to log attendance.', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Subjects</h2>
            <p className="text-sm text-zinc-500">Configure your semester subjects and attendance goals.</p>
          </div>
          <Button onClick={handleOpenAdd} className="flex items-center gap-1.5 py-2.5 rounded-xl">
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
        </div>

        {/* Subjects List Grid */}
        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-3xl text-center space-y-4">
            <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700 animate-bounce" />
            <h3 className="text-lg font-bold">No subjects tracked yet</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Add your first subject to start logging daily attendance and getting safety calculators.
            </p>
            <Button onClick={handleOpenAdd} variant="primary" className="px-5">
              Add Subject Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => {
              const ringColor = sub.color || '#2563EB';
              const percent = sub.currentPercent;
              const target = sub.minimumAttendance;
              
              // Safe styling helper
              const borderStyles =
                sub.status === 'Critical'
                  ? 'border-red-500/20 shadow-red-500/5 hover:border-red-500/40'
                  : sub.status === 'Warning'
                  ? 'border-amber-500/20 shadow-amber-500/5 hover:border-amber-500/40'
                  : 'border-zinc-100 dark:border-zinc-900 hover:border-blue-500/20';

              return (
                <Card key={sub.id} className={`flex flex-col justify-between border ${borderStyles}`}>
                  <CardContent className="p-6 space-y-5">
                    
                    {/* Top Subject Color and Buttons */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: ringColor }} />
                        <h3 className="font-bold text-zinc-900 dark:text-white leading-tight">
                          {sub.subjectName}
                        </h3>
                      </div>
                      
                      {/* Action Icon buttons */}
                      <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Faculty and attendance fraction */}
                    <div className="space-y-1">
                      {sub.facultyName && (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <User className="w-3 h-3" />
                          {sub.facultyName}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Attended: <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{sub.attendedClasses}</strong> / {sub.totalClasses} classes
                      </span>
                    </div>

                    {/* Progress Percentage Visual */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-400">Current: {percent}%</span>
                        <span className="text-blue-500">Goal: {target}%</span>
                      </div>
                      {/* Custom progress bar */}
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(percent, 100)}%`,
                            backgroundColor: ringColor
                          }}
                        />
                      </div>
                    </div>

                    {/* Decision Insight badge */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Verdict</span>
                        <span className={`font-bold ${sub.safeToSkip ? 'text-emerald-500' : 'text-red-500'}`}>
                          {sub.safeToSkip ? 'Safe to Skip Today' : 'Must Attend Today'}
                        </span>
                      </div>
                      <div className="text-right flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">
                          {sub.safeToSkip ? 'Skips Allowed' : 'Required Classes'}
                        </span>
                        <span className="font-extrabold text-zinc-700 dark:text-zinc-200">
                          {sub.safeToSkip ? `${sub.classesCanSkip} skip(s)` : `${sub.classesNeeded} class(es)`}
                        </span>
                      </div>
                    </div>

                    {/* Inline Quick Logging */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => handleQuickLog(sub.id, 'present')}
                        className="py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 active:scale-[0.98] transition-all"
                      >
                        + Present
                      </button>
                      <button
                        onClick={() => handleQuickLog(sub.id, 'absent')}
                        className="py-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 active:scale-[0.98] transition-all"
                      >
                        + Absent
                      </button>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog Add Subject */}
        <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Subject">
          <form onSubmit={handleAddSubject} className="space-y-4">
            <Input
              label="Subject Name *"
              name="subjectName"
              placeholder="e.g. Artificial Intelligence"
              value={formData.subjectName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Faculty Name"
              name="facultyName"
              placeholder="e.g. Dr. Ada Lovelace"
              value={formData.facultyName}
              onChange={handleInputChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Classes Attended"
                name="attendedClasses"
                type="number"
                min={0}
                value={formData.attendedClasses}
                onChange={handleInputChange}
              />
              <Input
                label="Total Classes"
                name="totalClasses"
                type="number"
                min={0}
                value={formData.totalClasses}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Attendance Goal (%)"
                name="minimumAttendance"
                type="number"
                min={0}
                max={100}
                value={formData.minimumAttendance}
                onChange={handleInputChange}
              />
              <Select
                label="Card Accent Color"
                name="color"
                options={COLORS}
                value={formData.color}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="w-full py-2.5 mt-2" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Subject'}
            </Button>
          </form>
        </Dialog>

        {/* Dialog Edit Subject */}
        <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Subject">
          <form onSubmit={handleEditSubject} className="space-y-4">
            <Input
              label="Subject Name *"
              name="subjectName"
              placeholder="e.g. Artificial Intelligence"
              value={formData.subjectName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Faculty Name"
              name="facultyName"
              placeholder="e.g. Dr. Ada Lovelace"
              value={formData.facultyName}
              onChange={handleInputChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Classes Attended"
                name="attendedClasses"
                type="number"
                min={0}
                value={formData.attendedClasses}
                onChange={handleInputChange}
              />
              <Input
                label="Total Classes"
                name="totalClasses"
                type="number"
                min={0}
                value={formData.totalClasses}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Attendance Goal (%)"
                name="minimumAttendance"
                type="number"
                min={0}
                max={100}
                value={formData.minimumAttendance}
                onChange={handleInputChange}
              />
              <Select
                label="Card Accent Color"
                name="color"
                options={COLORS}
                value={formData.color}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="w-full py-2.5 mt-2" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </form>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
