'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, useToast, Button, Dialog, Select, Input } from '../../components/ui/core';
import { api } from '../../lib/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Trash2,
  AlertCircle
} from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'Holiday', value: 'holiday' },
  { label: 'Main Exam', value: 'exam' },
  { label: 'Internal Test', value: 'internal' },
  { label: 'Lab Session', value: 'lab' }
];

export default function CalendarPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Modal states
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('present');
  const [lectureNumber, setLectureNumber] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchCalendarData = async () => {
    try {
      const logsData = await api.getLogs();
      const subjectsData = await api.getSubjects();
      setLogs(logsData);
      setSubjects(subjectsData);
      if (subjectsData.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjectsData[0].id);
      }
    } catch (error: any) {
      toast(error.message || 'Error fetching calendar details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding offset days
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Calendar days
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsLogOpen(true);
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSubjectId || !selectedStatus) {
      toast('Please fill in all details.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.createLog({
        subjectId: selectedSubjectId,
        date: selectedDate.toISOString(),
        status: selectedStatus,
        lectureNumber
      });
      toast('Attendance logged successfully!', 'success');
      setIsLogOpen(false);
      fetchCalendarData();
    } catch (error: any) {
      toast(error.message || 'Failed to save attendance log.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this log? Subject statistics will update.')) {
      return;
    }
    try {
      await api.deleteLog(logId);
      toast('Attendance log deleted!', 'success');
      setIsLogOpen(false);
      fetchCalendarData();
    } catch (error: any) {
      toast(error.message || 'Failed to delete log.', 'error');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarDays = getDaysInMonth(currentDate);

  // Status styling map for logs
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500 text-white';
      case 'absent':
        return 'bg-red-500 text-white';
      case 'holiday':
        return 'bg-zinc-500 text-white';
      case 'exam':
        return 'bg-purple-600 text-white';
      case 'internal':
        return 'bg-amber-500 text-black';
      case 'lab':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-zinc-300 text-black';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Monthly Calendar</h2>
            <p className="text-sm text-zinc-500">Track and log your attendance logs directly on dates.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-500" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days Week labels */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-zinc-400">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="aspect-square bg-zinc-50/20 dark:bg-zinc-900/10 rounded-xl border border-dashed border-zinc-100 dark:border-zinc-900/50"
                      />
                    );
                  }

                  const dayStr = day.toDateString();
                  const isToday = new Date().toDateString() === dayStr;
                  const dayLogs = logs.filter(
                    (log) => new Date(log.date).toDateString() === dayStr
                  );

                  return (
                    <div
                      key={dayStr}
                      onClick={() => handleDayClick(day)}
                      className={`aspect-square p-2 border border-zinc-100 dark:border-zinc-900/50 hover:border-blue-500/30 rounded-xl cursor-pointer flex flex-col justify-between transition-colors bg-white dark:bg-zinc-950/60 ${
                        isToday ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-black' : ''
                      }`}
                    >
                      <span className="text-xs font-bold text-zinc-400">{day.getDate()}</span>
                      
                      {/* Show active logs inside day box */}
                      <div className="flex flex-wrap gap-1 mt-1 max-h-[70%] overflow-y-auto">
                        {dayLogs.map((log) => (
                          <div
                            key={log._id}
                            className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${getStatusStyle(log.status)} truncate max-w-full`}
                            title={`${log.subjectId?.subjectName || 'Subject'}: ${log.status}`}
                          >
                            {(log.subjectId?.subjectName || 'S').substring(0, 3)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>
        )}

        {/* Dialog for Logging Attendance */}
        <Dialog
          isOpen={isLogOpen}
          onClose={() => setIsLogOpen(false)}
          title={`Mark Attendance: ${selectedDate ? selectedDate.toLocaleDateString() : ''}`}
        >
          <div className="space-y-6">
            
            {/* Show logs already marked on this day */}
            {selectedDate && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400">Marked Logs for this Day</span>
                {logs.filter((l) => new Date(l.date).toDateString() === selectedDate.toDateString()).length === 0 ? (
                  <p className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900 p-3 rounded-xl">
                    No classes logged on this day yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {logs
                      .filter((l) => new Date(l.date).toDateString() === selectedDate.toDateString())
                      .map((log) => (
                        <div
                          key={log._id}
                          className="flex items-center justify-between p-2.5 border border-zinc-100 dark:border-zinc-900 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900/40"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: log.subjectId?.color || '#3b82f6' }}
                            />
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {log.subjectId?.subjectName}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusStyle(log.status)}`}>
                              {log.status}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteLog(log._id)}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-500/5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Create new log form */}
            <form onSubmit={handleSaveLog} className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900/50">
              <span className="text-xs font-bold text-zinc-400 block">Log New Class Session</span>
              
              {subjects.length === 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <AlertCircle className="w-4 h-4" />
                  Please create a subject under "Subjects" first.
                </div>
              ) : (
                <>
                  <Select
                    label="Subject"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    options={subjects.map((sub) => ({ label: sub.subjectName, value: sub.id }))}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Status"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      options={STATUS_OPTIONS}
                    />
                    <Input
                      label="Lecture Number"
                      type="number"
                      min={1}
                      value={lectureNumber}
                      onChange={(e) => setLectureNumber(Number(e.target.value))}
                    />
                  </div>

                  <Button type="submit" className="w-full py-2.5 mt-2" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Attendance'}
                  </Button>
                </>
              )}
            </form>

          </div>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
