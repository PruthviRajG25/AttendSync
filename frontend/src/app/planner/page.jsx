'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, Button, Input, Select, Dialog, useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import { ClipboardList, Plus, Trash2, CheckCircle2, Circle, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function PlannerPage() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Assignment');
  const [dueDate, setDueDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPlannerData = async () => {
    try {
      const plannerItems = await api.getPlannerItems();
      const subjectsData = await api.getSubjects();
      setItems(plannerItems);
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setSubjectId(subjectsData[0].id);
      }
    } catch (error) {
      toast(error.message || 'Error fetching study planner.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast('Title and due date are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.createPlannerItem({
        title,
        type,
        dueDate,
        subjectId: subjectId || undefined,
      });
      toast('Deadline added successfully!', 'success');
      setCreateOpen(false);
      setTitle('');
      fetchPlannerData();
    } catch (error) {
      toast(error.message || 'Failed to create planner item.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Todo' ? 'Done' : 'Todo';
    try {
      await api.updatePlannerItem(item._id, { status: nextStatus });
      toast(`Marked as ${nextStatus.toLowerCase()}!`, 'success');
      fetchPlannerData();
    } catch (error) {
      toast(error.message || 'Failed to toggle status.', 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.deletePlannerItem(id);
      toast('Item deleted successfully!', 'success');
      fetchPlannerData();
    } catch (error) {
      toast(error.message || 'Failed to delete planner item.', 'error');
    }
  };

  const todoItems = items.filter((i) => i.status === 'Todo');
  const completedItems = items.filter((i) => i.status === 'Done');

  const typeOptions = [
    { value: 'Assignment', label: 'Assignment' },
    { value: 'Exam', label: 'Semester Exam' },
    { value: 'Internal Test', label: 'Internal Assessment' },
    { value: 'Lab Exam', label: 'Practical Lab Exam' },
    { value: 'Project Milestone', label: 'Project Submission' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-zinc-500">Loading study planner...</span>
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
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Study Planner & Deadlines</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Track upcoming assignments and exams linked to your subjects</p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            variant="primary"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </Button>
        </div>

        {/* Planner Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Active Deadlines */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Active Deadlines ({todoItems.length})
            </h3>

            {todoItems.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-12 border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent text-center">
                <ClipboardList className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-3" />
                <span className="text-xs font-bold text-zinc-500">All caught up!</span>
                <p className="text-[10px] text-zinc-400 mt-1">No active deadlines pending submission</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {todoItems.map((item) => (
                  <Card key={item._id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="text-zinc-400 hover:text-blue-500 transition-colors mt-0.5"
                        >
                          <Circle className="w-4.5 h-4.5" />
                        </button>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.title}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            {item.type} • Due: {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                          {item.subjectId && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.subjectId.color }} />
                              <span className="text-[9px] font-bold text-zinc-500">{item.subjectId.subjectName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Completed */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Completed ({completedItems.length})
            </h3>

            {completedItems.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-12 border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent text-center">
                <span className="text-xs font-bold text-zinc-400">No completed tasks yet</span>
              </Card>
            ) : (
              <div className="space-y-3 opacity-60">
                {completedItems.map((item) => (
                  <Card key={item._id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="text-emerald-500 hover:text-zinc-400 transition-colors mt-0.5"
                        >
                          <CheckCircle2 className="w-4.5 h-4.5 fill-emerald-500/10" />
                        </button>
                        <div className="flex flex-col line-through">
                          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{item.title}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            {item.type} • Completed
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* --- Dialog: Add Planner Item --- */}
        <Dialog isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Study Milestone">
          <form onSubmit={handleCreateItem} className="space-y-4">
            <Input
              label="Milestone Title"
              placeholder="e.g. Finish Physics Lab Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={typeOptions}
              />
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            {subjects.length > 0 && (
              <Select
                label="Associate Subject (Optional)"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                options={[
                  { value: '', label: 'None' },
                  ...subjects.map((sub) => ({ value: sub.id, label: sub.subjectName })),
                ]}
              />
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Milestone'}
              </Button>
            </div>
          </form>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
