'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, useToast, Button, Dialog, Select, Input } from '../../components/ui/core';
import { api } from '../../lib/api';
import {
  ClipboardList,
  Plus,
  Trash2,
  Calendar,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle
} from 'lucide-react';

const PLANNER_TYPES = [
  { label: 'Semester Exam', value: 'Exam' },
  { label: 'Assignment Work', value: 'Assignment' },
  { label: 'Internal Test', value: 'Internal Test' },
  { label: 'Lab Practical', value: 'Lab Exam' },
  { label: 'Project Milestone', value: 'Project Milestone' }
];

export default function PlannerPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Assignment');
  const [dueDate, setDueDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchPlannerDetails = async () => {
    try {
      const itemsData = await api.getPlannerItems();
      const subjectsData = await api.getSubjects();
      setItems(itemsData);
      setSubjects(subjectsData);
      if (subjectsData.length > 0 && !subjectId) {
        setSubjectId(subjectsData[0].id);
      }
    } catch (error: any) {
      toast(error.message || 'Error fetching planner data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerDetails();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type || !dueDate) {
      toast('Please enter title, type, and due date.', 'error');
      return;
    }
    setAdding(true);
    try {
      await api.createPlannerItem({
        title,
        type,
        dueDate,
        subjectId: subjectId || undefined
      });
      toast('Planner item added successfully!', 'success');
      setIsAddOpen(false);
      setTitle('');
      setDueDate('');
      fetchPlannerDetails();
    } catch (error: any) {
      toast(error.message || 'Failed to add planner item.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const nextStatus = item.status === 'Todo' ? 'Done' : 'Todo';
    try {
      await api.updatePlannerItem(item._id, { status: nextStatus });
      toast(`Marked task as ${nextStatus === 'Done' ? 'Completed' : 'Pending'}!`, 'success');
      fetchPlannerDetails();
    } catch (error: any) {
      toast(error.message || 'Failed to toggle task status.', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this deadline item?')) {
      return;
    }
    try {
      await api.deletePlannerItem(id);
      toast('Item deleted.', 'success');
      fetchPlannerDetails();
    } catch (error: any) {
      toast(error.message || 'Failed to delete item.', 'error');
    }
  };

  // Calculate percentage of tasks completed
  const totalTasksCount = items.length;
  const completedTasksCount = items.filter((item) => item.status === 'Done').length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Sorting: Todo tasks first, then by due date ascending
  const sortedItems = [...items].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'Todo' ? -1 : 1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Study Planner</h2>
            <p className="text-sm text-zinc-500">Track deadlines, assignments, and test schedules alongside your attendance.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-1.5 py-2.5 rounded-xl">
            <Plus className="w-4 h-4" />
            Add Deadline
          </Button>
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 w-full sm:max-w-md">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Task Completion progress</span>
                  <span className="text-blue-500">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-zinc-400 font-medium">
                Completed <strong className="text-zinc-700 dark:text-zinc-200">{completedTasksCount}</strong> of {totalTasksCount} deadlines
              </div>
            </CardContent>
          </Card>
        )}

        {/* Planner items checklist */}
        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-3xl text-center space-y-4">
            <ClipboardList className="w-12 h-12 text-zinc-300 dark:text-zinc-700 animate-bounce" />
            <h3 className="text-lg font-bold">No academic deadlines logged</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Keep track of exams, tests, and lab report submissions right next to your attendance limits.
            </p>
            <Button onClick={() => setIsAddOpen(true)} variant="primary" className="px-5">
              Add Deadline Now
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => {
              const isCompleted = item.status === 'Done';
              const subjectColor = item.subjectId?.color || '#a1a1aa';
              const dueDateObj = new Date(item.dueDate);
              const daysRemaining = Math.ceil(
                (dueDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={item._id} className={`border ${isCompleted ? 'opacity-65' : ''}`}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Checkbox button */}
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className="text-zinc-400 hover:text-blue-500 transition-colors"
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-sm font-semibold truncate ${isCompleted ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                            {item.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                            {item.type}
                          </span>
                          {item.subjectId && (
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: subjectColor }}
                              title={item.subjectId.subjectName}
                            />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {dueDateObj.toLocaleDateString()}</span>
                          {!isCompleted && (
                            <span className={`font-bold ${daysRemaining <= 2 ? 'text-red-500' : 'text-zinc-400'}`}>
                              ({daysRemaining === 0 ? 'Due today' : daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days left`})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/5 hover:opacity-100 transition-all opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog Add Item */}
        <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Academic Deadline">
          <form onSubmit={handleCreateItem} className="space-y-4">
            <Input
              label="Task / Deadline Title *"
              placeholder="e.g. Chemistry Lab Practical Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Task Category"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={PLANNER_TYPES}
              />
              <Input
                label="Due Date *"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            
            {subjects.length > 0 && (
              <Select
                label="Associated Subject (Optional)"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                options={[{ label: 'No Specific Subject', value: '' }, ...subjects.map((sub) => ({ label: sub.subjectName, value: sub.id }))]}
              />
            )}

            <Button type="submit" className="w-full py-2.5 mt-2" disabled={adding}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Deadline'}
            </Button>
          </form>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
