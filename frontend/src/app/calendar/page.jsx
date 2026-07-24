'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, Button, Dialog, Select, useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import {
  CalendarDays,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  PlusCircle
} from 'lucide-react';

export default function CalendarPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dialogs
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Form states
  const [subjectId, setSubjectId] = useState('');
  const [status, setStatus] = useState('present');
  const [submitting, setSubmitting] = useState(false);

  const fetchCalendarData = async () => {
    try {
      const logsData = await api.getLogs();
      const subjectsData = await api.getSubjects();
      setLogs(logsData);
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setSubjectId(subjectsData[0].id);
      }
    } catch (error) {
      toast(error.message || 'Error fetching calendar details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayNum) => {
    const clickedDate = new Date(year, month, dayNum);
    setSelectedDate(clickedDate);
    setLogDialogOpen(true);
  };

  const handleCreateLog = async (e) => {
    e.preventDefault();
    if (!subjectId) {
      toast('Please select a subject.', 'error');
      return;
    }
    setSubmitting(true);

    const dayLogs = getDayLogsForSelectedDate();
    const subjectLogsCount = dayLogs.filter((log) => {
      const logSubId = log.subjectId?._id || log.subjectId;
      return String(logSubId) === String(subjectId);
    }).length;
    const nextLectureNumber = subjectLogsCount + 1;

    try {
      await api.createLog({
        subjectId,
        status,
        date: selectedDate,
        lectureNumber: nextLectureNumber,
      });
      toast('Attendance log recorded successfully!', 'success');
      setLogDialogOpen(false);
      fetchCalendarData();
    } catch (error) {
      toast(error.message || 'Failed to record log.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    setSubmitting(true);
    try {
      await api.deleteLog(logId);
      toast('Log deleted successfully!', 'success');
      setLogDialogOpen(false);
      fetchCalendarData();
    } catch (error) {
      toast(error.message || 'Failed to delete log.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Calendar Grid cells
  const renderCells = () => {
    const cells = [];
    
    // Blank spots before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 bg-zinc-50/20 dark:bg-zinc-950/5 border border-zinc-100 dark:border-zinc-900/50 rounded-xl" />);
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateString = new Date(year, month, dayNum).toDateString();
      const dayLogs = logs.filter((log) => new Date(log.date).toDateString() === dateString);

      cells.push(
        <div
          key={`day-${dayNum}`}
          onClick={() => handleDayClick(dayNum)}
          className="h-24 p-2 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl hover:border-blue-500/30 transition-all cursor-pointer flex flex-col justify-between"
        >
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-600">{dayNum}</span>
          
          <div className="space-y-1 overflow-y-auto max-h-14 pr-0.5">
            {dayLogs.map((log) => (
              <div
                key={log._id}
                className={`text-[9px] px-1 py-0.5 rounded font-bold truncate ${
                  log.status === 'present'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10'
                    : log.status === 'absent'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10'
                    : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/10'
                }`}
              >
                L{log.lectureNumber}: {log.subjectId?.subjectName || 'Subject'}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  const getDayLogsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toDateString();
    return logs.filter((log) => new Date(log.date).toDateString() === dateStr);
  };

  const statusOptions = [
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'exam', label: 'Exam' },
    { value: 'lab', label: 'Lab Practical' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-zinc-500">Loading calendar tracker...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Navigation header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Attendance Planner</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Manage daily records and inspect monthly logs</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl px-4 py-2 shadow-sm">
            <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              <ChevronLeft className="w-4 h-4 text-zinc-500" />
            </button>
            <span className="text-sm font-bold w-32 text-center text-zinc-700 dark:text-zinc-300">
              {months[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Days of Week label */}
        <div className="grid grid-cols-7 gap-3 text-center text-xs font-bold text-zinc-400 dark:text-zinc-600">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-3">
          {renderCells()}
        </div>

        {/* Dialog: Day Details / Create Log */}
        <Dialog
          isOpen={logDialogOpen}
          onClose={() => setLogDialogOpen(false)}
          title={selectedDate ? `Logs for ${selectedDate.toLocaleDateString()}` : 'Date Log'}
        >
          <div className="space-y-6">
            
            {/* Existing logs list */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-400">Current Logs on this Date</h3>
              {getDayLogsForSelectedDate().length === 0 ? (
                <p className="text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                  No attendance registered on this day.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {getDayLogsForSelectedDate().map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: log.subjectId?.color }} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            {log.subjectId?.subjectName || 'Subject'}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            Lecture {log.lectureNumber} • Status: <span className="font-bold capitalize">{log.status}</span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLog(log._id)}
                        disabled={submitting}
                        className="p-1 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form to log new entry */}
            {subjects.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-4">Add subjects before logging attendance.</p>
            ) : (
              <form onSubmit={handleCreateLog} className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <h3 className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
                  Log New Lecture
                </h3>
                
                <Select
                  label="Subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  options={subjects.map((sub) => ({ value: sub.id, label: sub.subjectName }))}
                />

                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={statusOptions}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setLogDialogOpen(false)}>
                    Close
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Attendance'}
                  </Button>
                </div>
              </form>
            )}

          </div>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
