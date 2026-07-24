'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/core';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Zap,
  Info,
  CalendarDays,
  Check,
  X,
  Loader2,
  Bell
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const analytics = await api.getAnalytics();
      const subs = await api.getSubjects();
      setData(analytics);
      setSubjects(subs);
    } catch (error) {
      toast(error.message || 'Error loading dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickLog = async (subjectId, status) => {
    setActionLoadingId(`${subjectId}-${status}`);
    try {
      await api.quickUpdateLog({ subjectId, status });
      toast('Attendance logged successfully!', 'success');
      await fetchDashboardData();
    } catch (error) {
      toast(error.message || 'Failed to log attendance.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-zinc-500">Loading dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const summary = data?.summary || {
    overallAttendance: 100,
    safeStatus: 'Safe',
    totalSubjects: 0,
    totalClasses: 0,
    classesAttended: 0,
    classesMissed: 0,
    attendanceGoal: 75,
    totalSkipsAllowed: 0,
    mostMissedSubject: 'None',
    streakCount: 0,
  };

  const getStatusColor = (status) => {
    if (status === 'Safe') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'Warning') return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Welcome Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Hey, {user?.name || 'Student'} 👋
            </h2>
            <p className="text-zinc-500 text-sm mt-0.5">
              Here is your attendance status and bunk feasibility summary for today.
            </p>
          </div>
          {summary.streakCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-600 dark:text-orange-400 text-xs font-bold shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current" />
              {summary.streakCount} Day Present Streak!
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Attendance */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-500">Overall Attendance</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <span className="text-3xl font-extrabold">{summary.overallAttendance}%</span>
                <p className="text-[10px] text-zinc-400 mt-1">Goal: {summary.attendanceGoal}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Status */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-500">Safe Status</span>
                {summary.safeStatus === 'Safe' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getStatusColor(summary.safeStatus)}`}>
                  {summary.safeStatus}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Skips */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-500">Skips Feasible</span>
                <Calendar className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <span className="text-3xl font-extrabold">{summary.totalSkipsAllowed}</span>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {summary.totalSkipsAllowed === 1 ? 'for a single subject' : 'across all subjects combined'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Classes */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-500">Classes Logged</span>
                <Info className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <span className="text-3xl font-extrabold">{summary.classesAttended}/{summary.totalClasses}</span>
                <p className="text-[10px] text-zinc-400 mt-1">Attended/Total lectures logged</p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Charts & Quick Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Weekly Attendance Trend</h3>
                <p className="text-[11px] text-zinc-400">Activity registered in the last 7 days</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.weeklyAttendance || []}>
                    <defs>
                      <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a10" className="dark:stroke-zinc-800/20" />
                    <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip
                      contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPercentage)" name="Attendance" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Attendance Log */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Quick Log Attendance</h3>
                <p className="text-[11px] text-zinc-400">Update today's status in a single click</p>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
                {subjects.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-6 text-center">No subjects created yet. Add subjects to log attendance.</p>
                ) : (
                  subjects.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20">
                      <div className="flex items-center gap-2 max-w-[50%]">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
                        <span className="text-xs font-bold truncate text-zinc-700 dark:text-zinc-300">{sub.subjectName}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleQuickLog(sub.id, 'present')}
                          disabled={actionLoadingId !== null}
                          className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          {actionLoadingId === `${sub.id}-present` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleQuickLog(sub.id, 'absent')}
                          disabled={actionLoadingId !== null}
                          className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          {actionLoadingId === `${sub.id}-absent` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Notifications and Subject Wise Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Notifications */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Alerts & Actions</h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(!data?.notifications || data.notifications.length === 0) ? (
                  <p className="text-xs text-zinc-400 py-6 text-center">No alerts. All attendance is looking healthy!</p>
                ) : (
                  data.notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        notif.type === 'critical'
                          ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                          : notif.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold leading-normal">{notif.text}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subject Wise Bar Chart */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Subject-wise Attendance</h3>
                <p className="text-[11px] text-zinc-400">Current levels for each registered subject</p>
              </div>
              <div className="h-64 w-full">
                {subjects.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-xs text-zinc-400 py-6 text-center">No subjects created yet.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.subjectWiseAttendance || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a10" className="dark:stroke-zinc-800/20" />
                      <XAxis
                        dataKey="subjectName"
                        stroke="#a1a1aa"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 12)}...` : value}
                      />
                      <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                      <Tooltip
                        contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="percentage" radius={[10, 10, 0, 0]} name="Percentage">
                        {(data?.subjectWiseAttendance || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </DashboardLayout>
  );
}
