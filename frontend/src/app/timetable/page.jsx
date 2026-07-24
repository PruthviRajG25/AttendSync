'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, Button, Dialog, Select, useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import { CalendarDays, Plus, Trash2, Loader2, Sparkles } from 'lucide-react';

export default function TimetablePage() {
  const { toast } = useToast();
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);

  // Form states
  const [day, setDay] = useState('Monday');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 10:00 AM');
  const [subjectId, setSubjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTimetableData = async () => {
    try {
      const slots = await api.getTimetable();
      const subjectsData = await api.getSubjects();
      setTimetableSlots(slots);
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setSubjectId(subjectsData[0].id);
      }
    } catch (error) {
      toast(error.message || 'Error loading timetable.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetableData();
  }, []);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!subjectId) {
      toast('Please select a subject.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.createTimetableSlot({ day, timeSlot, subjectId });
      toast('Timetable slot added successfully!', 'success');
      setCreateOpen(false);
      fetchTimetableData();
    } catch (error) {
      toast(error.message || 'Failed to add timetable slot.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await api.deleteTimetableSlot(id);
      toast('Timetable slot removed successfully!', 'success');
      fetchTimetableData();
    } catch (error) {
      toast(error.message || 'Failed to remove slot.', 'error');
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getSlotsForDay = (dayName) => {
    return timetableSlots
      .filter((s) => s.day === dayName)
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  };

  const timeSlotOptions = [
    { value: '09:00 AM - 10:00 AM', label: '09:00 AM - 10:00 AM' },
    { value: '10:00 AM - 11:00 AM', label: '10:00 AM - 11:00 AM' },
    { value: '11:00 AM - 12:00 PM', label: '11:00 AM - 12:00 PM' },
    { value: '12:00 PM - 01:00 PM', label: '12:00 PM - 01:00 PM' },
    { value: '01:00 PM - 02:00 PM', label: '01:00 PM - 02:00 PM' },
    { value: '02:00 PM - 03:00 PM', label: '02:00 PM - 03:00 PM' },
    { value: '03:00 PM - 04:00 PM', label: '03:00 PM - 04:00 PM' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-zinc-500">Loading weekly timetable...</span>
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
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Weekly Timetable</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Map weekly lecture slots to speed up dashboard log triggers</p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            variant="primary"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </Button>
        </div>

        {/* Timetable Grid mapping */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {daysOfWeek.map((dayName) => {
            const daySlots = getSlotsForDay(dayName);
            return (
              <Card key={dayName} className="flex flex-col h-full bg-white dark:bg-zinc-950/80">
                <div className="p-4 border-b border-zinc-50 dark:border-zinc-900/50 text-center">
                  <h3 className="text-xs font-extrabold text-zinc-500 tracking-wider uppercase">{dayName}</h3>
                </div>

                <div className="flex-1 p-4 space-y-3.5 min-h-[300px]">
                  {daySlots.length === 0 ? (
                    <div className="flex h-full items-center justify-center py-12 text-center">
                      <span className="text-[10px] font-bold text-zinc-400">No classes mapped</span>
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot._id}
                        className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950/40 relative group transition-all"
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                          style={{ backgroundColor: slot.subjectId?.color }}
                        />
                        <div className="flex justify-between items-start gap-2 pl-1.5">
                          <div className="flex flex-col space-y-1 max-w-[80%]">
                            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight truncate">
                              {slot.subjectId?.subjectName || 'Deleted Course'}
                            </span>
                            <span className="text-[9px] font-semibold text-zinc-400">
                              {slot.timeSlot.split(' - ')[0]}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteSlot(slot._id)}
                            className="text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 p-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100 absolute right-2.5 top-2.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* --- Dialog: Create Timetable Slot --- */}
        <Dialog isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Timetable Slot">
          {subjects.length === 0 ? (
            <div className="space-y-4 text-center py-4">
              <p className="text-xs text-zinc-400">You must create a subject before adding class slots.</p>
              <Button onClick={() => setCreateOpen(false)} variant="secondary">Cancel</Button>
            </div>
          ) : (
            <form onSubmit={handleCreateSlot} className="space-y-4">
              <Select
                label="Select Day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                options={daysOfWeek.map((d) => ({ value: d, label: d }))}
              />

              <Select
                label="Select Time Slot"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                options={timeSlotOptions}
              />

              <Select
                label="Associated Subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                options={subjects.map((sub) => ({ value: sub.id, label: sub.subjectName }))}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Slot'}
                </Button>
              </div>
            </form>
          )}
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
