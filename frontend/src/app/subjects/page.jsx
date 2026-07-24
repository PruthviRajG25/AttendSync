'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useToast, Card, CardContent, Button, Input, Dialog } from '../../components/ui/core';
import { api } from '../../lib/api';
import { BookOpen, Plus, Edit2, Trash2, Loader2, Sparkles, Sliders } from 'lucide-react';

export default function SubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [attendedClasses, setAttendedClasses] = useState('0');
  const [totalClasses, setTotalClasses] = useState('0');
  const [minimumAttendance, setMinimumAttendance] = useState('75');
  const [color, setColor] = useState('#3b82f6');
  
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const colors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#14b8a6', // Teal
  ];

  const fetchSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (error) {
      toast(error.message || 'Failed to fetch subjects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const resetForm = () => {
    setSubjectName('');
    setFacultyName('');
    setAttendedClasses('0');
    setTotalClasses('0');
    setMinimumAttendance('75');
    setColor('#3b82f6');
    setSelectedSubjectId(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toast('Subject name is required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.createSubject({
        subjectName,
        facultyName,
        attendedClasses: Number(attendedClasses),
        totalClasses: Number(totalClasses),
        minimumAttendance: Number(minimumAttendance),
        color,
      });
      toast('Subject created successfully!', 'success');
      setCreateOpen(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      toast(error.message || 'Failed to create subject.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (sub) => {
    setSelectedSubjectId(sub.id);
    setSubjectName(sub.subjectName);
    setFacultyName(sub.facultyName);
    setAttendedClasses(String(sub.attendedClasses));
    setTotalClasses(String(sub.totalClasses));
    setMinimumAttendance(String(sub.minimumAttendance));
    setColor(sub.color);
    setEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toast('Subject name is required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.updateSubject(selectedSubjectId, {
        subjectName,
        facultyName,
        attendedClasses: Number(attendedClasses),
        totalClasses: Number(totalClasses),
        minimumAttendance: Number(minimumAttendance),
        color,
      });
      toast('Subject updated successfully!', 'success');
      setEditOpen(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      toast(error.message || 'Failed to update subject.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedSubjectId(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      await api.deleteSubject(selectedSubjectId);
      toast('Subject deleted successfully!', 'success');
      setDeleteOpen(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      toast(error.message || 'Failed to delete subject.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Safe') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'Warning') return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-zinc-500">Loading subjects...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Your Subjects</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Add and manage courses in your active semester</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setCreateOpen(true);
            }}
            variant="primary"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
        </div>

        {/* Subjects List */}
        {subjects.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 px-4 text-center border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent">
            <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No subjects tracked yet</h3>
            <p className="text-xs text-zinc-400 max-w-xs mt-1.5 leading-relaxed">
              Create your first course subject to configure attendance goals and calculate skip margins.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              variant="secondary"
              className="mt-6 text-xs font-semibold"
            >
              Add Subject Now
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((sub) => (
              <Card key={sub.id} className="relative overflow-hidden group">
                
                {/* Visual Color Tag line */}
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: sub.color }} />

                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4 pt-1.5">
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-white tracking-tight">{sub.subjectName}</h3>
                      {sub.facultyName && (
                        <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">{sub.facultyName}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(sub)}
                        className="p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:text-blue-500 hover:border-blue-500/20 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sub.id)}
                        className="p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:text-red-500 hover:border-red-500/20 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Attendance stats representation */}
                  <div className="grid grid-cols-3 gap-4 border-y border-zinc-50 dark:border-zinc-900/50 py-3.5 text-center">
                    <div>
                      <span className="text-xs font-semibold text-zinc-400">Attendance</span>
                      <p className="text-sm font-extrabold mt-1">{sub.currentPercent}%</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-400">Classes Logged</span>
                      <p className="text-sm font-extrabold mt-1">{sub.attendedClasses}/{sub.totalClasses}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-400">Goal</span>
                      <p className="text-sm font-extrabold mt-1">{sub.minimumAttendance}%</p>
                    </div>
                  </div>

                  {/* Prediction tags */}
                  <div className="flex items-center justify-between text-xs pt-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                    
                    {sub.classesCanSkip > 0 ? (
                      <span className="text-emerald-500 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Safe to skip {sub.classesCanSkip} {sub.classesCanSkip === 1 ? 'class' : 'classes'}
                      </span>
                    ) : sub.classesNeeded > 0 ? (
                      <span className="text-red-500 dark:text-red-400 text-[10px] font-bold">
                        Attend next {sub.classesNeeded} {sub.classesNeeded === 1 ? 'class' : 'classes'}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[10px] font-bold">On track to goal</span>
                    )}
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* --- Dialog: Create --- */}
        <Dialog isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Subject">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Subject Name"
              placeholder="e.g. Data Structures & Algorithms"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
            <Input
              label="Faculty Name (Optional)"
              placeholder="e.g. Dr. Ryan Gosling"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Classes Attended"
                type="number"
                min="0"
                value={attendedClasses}
                onChange={(e) => setAttendedClasses(e.target.value)}
              />
              <Input
                label="Total Classes Held"
                type="number"
                min="0"
                value={totalClasses}
                onChange={(e) => setTotalClasses(e.target.value)}
              />
            </div>
            <Input
              label="Minimum Attendance Required (%)"
              type="number"
              min="0"
              max="100"
              value={minimumAttendance}
              onChange={(e) => setMinimumAttendance(e.target.value)}
            />

            {/* Colors picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Card Color Tag</label>
              <div className="flex gap-2.5 flex-wrap">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      color === c ? 'ring-2 ring-blue-500 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* --- Dialog: Edit --- */}
        <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Subject">
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Subject Name"
              placeholder="e.g. Data Structures & Algorithms"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
            <Input
              label="Faculty Name (Optional)"
              placeholder="e.g. Dr. Ryan Gosling"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Classes Attended"
                type="number"
                min="0"
                value={attendedClasses}
                onChange={(e) => setAttendedClasses(e.target.value)}
              />
              <Input
                label="Total Classes Held"
                type="number"
                min="0"
                value={totalClasses}
                onChange={(e) => setTotalClasses(e.target.value)}
              />
            </div>
            <Input
              label="Minimum Attendance Required (%)"
              type="number"
              min="0"
              max="100"
              value={minimumAttendance}
              onChange={(e) => setMinimumAttendance(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Card Color Tag</label>
              <div className="flex gap-2.5 flex-wrap">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      color === c ? 'ring-2 ring-blue-500 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* --- Dialog: Delete Confirmation --- */}
        <Dialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Subject">
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
              Are you sure you want to delete this subject? This action will permanently remove all logs and timetable associations. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleDeleteConfirm} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Subject'}
              </Button>
            </div>
          </div>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
