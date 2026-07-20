'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Check,
  X,
  AlertTriangle,
  Award,
  Zap,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Bell,
  Clock,
  Loader2,
  CalendarDays,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import confetti from 'canvas-confetti';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const analytics = await api.getAnalytics();
      const subs = await api.getSubjects();
      setData(analytics);
      setSubjects(subs);
      
      // Trigger Confetti if overall attendance meets or exceeds goal
      if (analytics.summary.overallAttendance >= analytics.summary.attendanceGoal && analytics.summary.totalClasses > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error: any) {
      toast(error.message || 'Error loading dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickLog = async (subjectId: string, status: 'present' | 'absent') => {
    setActionLoadingId(`${subjectId}-${status}`);
    try {
      await api.quickUpdateLog({ subjectId, status });
      toast(`Logged class as ${status === 'present' ? 'Present' : 'Absent'}!`, 'success');
      await fetchDashboardData();
    } catch (error: any) {
      toast(error.message || 'Failed to log class.', 'error');
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
            <span className="text-sm text-zinc-500 font-medium">Assembling your statistics...</span>
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

  // Determine Today's Skip Decision Banner details
  const isSafe = summary.safeStatus === 'Safe' || summary.safeStatus === 'Warning';
  const skipsCount = summary.totalSkipsAllowed;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Hey, {user?.name}! 👋
            </h2>
            <p className="text-sm text-zinc-500">
              Here is your attendance snapshot for {user?.college || 'college'}.
            </p>
          </div>
          {/* Gamification Streak Banner */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-4 py-2.5 rounded-2xl">
            <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Streak: {summary.streakCount} Days! 🔥
              </span>
              <span className="text-[10px] text-zinc-500">Keep attending consistently</span>
            </div>
          </div>
        </div>

        {/* 1. Today's Decision - Hero Card */}
        <Card className="overflow-hidden border-2 border-blue-500/20 dark:bg-zinc-950 bg-white relative">
          <div className="absolute top-0 right-0 h-full w-48 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none -z-10" />
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <span className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                  Today's Decision
                </span>
                <h3 className="text-3xl font-extrabold tracking-tight">Can I Skip Today's Class?</h3>
                <p className="text-zinc-500 text-sm max-w-xl">
                  {skipsCount > 0
                    ? `You can safely miss ${skipsCount} more class${skipsCount > 1 ? 'es' : ''} across your subjects and remain above your ${summary.attendanceGoal}% target.`
                    : `No, you are at or below your target percentage. You need to attend your next classes to bring up your attendance.`}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 px-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center min-w-[160px]">
                <span className="text-xs font-semibold text-zinc-400">Verdict</span>
                <span
                  className={`text-4xl font-extrabold mt-1 tracking-tight ${
                    isSafe && skipsCount > 0
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {isSafe && skipsCount > 0 ? 'YES' : 'NO'}
                </span>
                <span
                  className={`text-[10px] font-bold mt-1 px-2.5 py-0.5 rounded-full ${
                    isSafe && skipsCount > 0
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {isSafe && skipsCount > 0 ? 'Safe to skip' : 'Attend lecture'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Numeric Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-28">
              <span className="text-xs font-bold text-zinc-400">Attendance</span>
              <div>
                <span className="text-2xl font-bold tracking-tight">{summary.overallAttendance}%</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      summary.safeStatus === 'Safe'
                        ? 'bg-emerald-500'
                        : summary.safeStatus === 'Warning'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{summary.safeStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-28">
              <span className="text-xs font-bold text-zinc-400">Subjects</span>
              <div>
                <span className="text-2xl font-bold tracking-tight">{summary.totalSubjects}</span>
                <p className="text-[10px] text-zinc-500 mt-1">Courses tracked</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-28">
              <span className="text-xs font-bold text-zinc-400">Total Lectures</span>
              <div>
                <span className="text-2xl font-bold tracking-tight">{summary.totalClasses}</span>
                <p className="text-[10px] text-zinc-500 mt-1">Scheduled sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-28">
              <span className="text-xs font-bold text-zinc-400">Attended</span>
              <div>
                <span className="text-2xl font-bold tracking-tight text-emerald-500">{summary.classesAttended}</span>
                <p className="text-[10px] text-zinc-500 mt-1">Lectures present</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-28">
              <span className="text-xs font-bold text-zinc-400">Missed</span>
              <div>
                <span className="text-2xl font-bold tracking-tight text-red-500">{summary.classesMissed}</span>
                <p className="text-[10px] text-zinc-500 mt-1">Lectures absent</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-28">
              <span className="text-xs font-bold text-zinc-400">Goal Target</span>
              <div>
                <span className="text-2xl font-bold tracking-tight text-blue-500">{summary.attendanceGoal}%</span>
                <p className="text-[10px] text-zinc-500 mt-1">Required rate</p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* 3. Daily Attendance Logger & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Quick Update Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md">
                <Clock className="w-4.5 h-4.5 text-blue-500" />
                Daily Attendance Logger
              </CardTitle>
              <p className="text-xs text-zinc-400">Log attendance for today's lectures in one-click.</p>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 text-xs">
                  No subjects found. Create a subject to start logging daily attendance!
                </div>
              ) : (
                <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                  {subjects.map((sub) => {
                    const isSubSafe = sub.status === 'Safe' || sub.status === 'Warning';
                    return (
                      <div key={sub.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ backgroundColor: sub.color || '#2563EB' }}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                              {sub.subjectName}
                            </span>
                            <span className="text-xs text-zinc-500 mt-0.5">
                              {sub.attendedClasses} / {sub.totalClasses} classes ({sub.currentPercent}%)
                            </span>
                          </div>
                        </div>

                        {/* Present / Absent Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickLog(sub.id, 'present')}
                            disabled={actionLoadingId !== null}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {actionLoadingId === `${sub.id}-present` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            + Present
                          </button>
                          <button
                            onClick={() => handleQuickLog(sub.id, 'absent')}
                            disabled={actionLoadingId !== null}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {actionLoadingId === `${sub.id}-absent` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            + Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md">
                <Bell className="w-4.5 h-4.5 text-blue-500" />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.notifications?.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-xs">
                  All clear! No critical warnings or deadlines upcoming.
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {data?.notifications?.map((notif: any) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        notif.type === 'critical'
                          ? 'bg-red-500/10 border-red-500/20 text-red-500'
                          : notif.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-semibold leading-relaxed">{notif.text}</p>
                        <span className="text-[9px] opacity-65">Just now</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* 4. Charts - Recharts Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Subject wise comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Subject-wise Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <div className="text-center py-20 text-zinc-400 text-xs">
                  Create subjects to generate comparison charts.
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data?.subjectWiseAttendance || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.1} />
                      <XAxis dataKey="subjectName" tick={{ fill: '#888', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#888', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#09090b',
                          borderColor: '#27272a',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="percentage" fill="#2563EB" radius={[8, 8, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Monthly Attendance Curve</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.monthlyTrend?.length === 0 || summary.totalClasses === 0 ? (
                <div className="text-center py-20 text-zinc-400 text-xs">
                  Log attendance to populate monthly charts.
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data?.monthlyTrend || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.1} />
                      <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#888', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#09090b',
                          borderColor: '#27272a',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Area type="monotone" dataKey="percentage" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorPercent)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>
    </DashboardLayout>
  );
}
