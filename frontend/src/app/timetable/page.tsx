'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, useToast, Button, Dialog, Select, Input } from '../../components/ui/core';
import { api } from '../../lib/api';
import {
  CalendarDays,
  Plus,
  Trash2,
  Check,
  X,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';

const DAYS = [
  { label: 'Monday', value: 'Monday' },
  { label: 'Tuesday', value: 'Tuesday' },
  { label: 'Wednesday', value: 'Wednesday' },
  { label: 'Thursday', value: 'Thursday' },
  { label: 'Friday', value: 'Friday' }
];

export default function TimetablePage() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [day, setDay] = useState('Monday');
  const [timeSlot, setTimeSlot] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [adding, setAdding] = useState(false);

  // Click slot action modal
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<any>(null);
  const [logging, setLogging] = useState(false);

  const fetchTimetable = async () => {
    try {
      const slotsData = await api.getTimetable();
      const subjectsData = await api.getSubjects();
      setSlots(slotsData);
      setSubjects(subjectsData);
      if (subjectsData.length > 0 && !subjectId) {
        setSubjectId(subjectsData[0].id);
      }
    } catch (error: any) {
      toast(error.message || 'Error loading timetable data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!day || !timeSlot || !subjectId) {
      toast('Please enter all schedule details.', 'error');
      return;
    }
    setAdding(true);
    try {
      await api.createTimetableSlot({ day, timeSlot, subjectId });
      toast('Timetable slot added successfully!', 'success');
      setIsAddOpen(false);
      setTimeSlot('');
      fetchTimetable();
    } catch (error: any) {
      toast(error.message || 'Failed to add timetable slot.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class slot?')) {
      return;
    }
    try {
      await api.deleteTimetableSlot(id);
      toast('Slot removed from timetable.', 'success');
      setIsActionOpen(false);
      fetchTimetable();
    } catch (error: any) {
      toast(error.message || 'Failed to delete slot.', 'error');
    }
  };

  const handleMarkAttendance = async (status: 'present' | 'absent') => {
    if (!activeSlot) return;
    setLogging(true);
    try {
      await api.quickUpdateLog({
        subjectId: activeSlot.subjectId?._id || activeSlot.subjectId,
        status
      });
      toast(`Successfully marked ${activeSlot.subjectId?.subjectName || 'lecture'} as ${status}!`, 'success');
      setIsActionOpen(false);
    } catch (error: any) {
      toast(error.message || 'Failed to update attendance logs.', 'error');
    } finally {
      setLogging(false);
    }
  };

  // Group slots by Day
  const slotsByDay = (dayName: string) => {
    return slots.filter((slot) => slot.day === dayName).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Weekly Timetable</h2>
            <p className="text-sm text-zinc-500">Organize your classes and click slots to quickly log attendance.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-1.5 py-2.5 rounded-xl">
            <Plus className="w-4 h-4" />
            Add Class Slot
          </Button>
        </div>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {DAYS.map((d) => {
              const daySlots = slotsByDay(d.value);
              return (
                <div key={d.value} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
                      {d.label}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {daySlots.length === 0 ? (
                      <div className="p-8 text-center text-xs text-zinc-400 bg-white/40 dark:bg-zinc-950/20 border border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
                        No lectures
                      </div>
                    ) : (
                      daySlots.map((slot) => {
                        const color = slot.subjectId?.color || '#3b82f6';
                        return (
                          <div
                            key={slot._id}
                            onClick={() => {
                              setActiveSlot(slot);
                              setIsActionOpen(true);
                            }}
                            className="p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 hover:border-blue-500/20 rounded-2xl cursor-pointer hover:shadow-md transition-all space-y-2 relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }} />
                            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {slot.timeSlot}
                            </span>
                            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight line-clamp-2">
                              {slot.subjectId?.subjectName || 'Unknown Course'}
                            </h4>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dialog Add Timetable Slot */}
        <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Timetable Slot">
          <form onSubmit={handleCreateSlot} className="space-y-4">
            <Select
              label="Select Day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              options={DAYS}
            />
            <Input
              label="Time Slot (e.g. 09:00 AM - 10:00 AM) *"
              type="text"
              placeholder="09:00 AM - 10:00 AM"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              required
            />
            {subjects.length === 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                <AlertCircle className="w-4 h-4" />
                Please create a subject under "Subjects" first.
              </div>
            ) : (
              <>
                <Select
                  label="Select Subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  options={subjects.map((sub) => ({ label: sub.subjectName, value: sub.id }))}
                />
                <Button type="submit" className="w-full py-2.5 mt-2" disabled={adding}>
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Schedule Slot'}
                </Button>
              </>
            )}
          </form>
        </Dialog>

        {/* Dialog Slot actions */}
        <Dialog
          isOpen={isActionOpen}
          onClose={() => setIsActionOpen(false)}
          title={activeSlot ? `${activeSlot.subjectId?.subjectName}` : 'Lecture Option'}
        >
          {activeSlot && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-3.5 rounded-xl">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Scheduled for {activeSlot.day} at {activeSlot.timeSlot}</span>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-400 block">Log Attendance for Today's Date</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleMarkAttendance('present')}
                    disabled={logging}
                    className="flex items-center justify-center gap-1.5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    <Check className="w-4.5 h-4.5" />
                    Mark Present
                  </button>
                  <button
                    onClick={() => handleMarkAttendance('absent')}
                    disabled={logging}
                    className="flex items-center justify-center gap-1.5 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    <X className="w-4.5 h-4.5" />
                    Mark Absent
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-50 dark:border-zinc-900/50 flex justify-end">
                <button
                  onClick={() => handleDeleteSlot(activeSlot._id)}
                  className="flex items-center gap-1 px-3.5 py-2 border border-red-500/10 bg-red-500/5 text-red-500 text-xs font-bold hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Class Slot
                </button>
              </div>
            </div>
          )}
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
