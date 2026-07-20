'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle,
  Loader2,
  Sparkles,
  Zap,
  Bookmark,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await api.getAnalytics();
      setData(analyticsData);
    } catch (error: any) {
      toast(error.message || 'Error loading analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
    streakCount: 0
  };

  // Generate date array for GitHub Heatmap (past 120 days)
  const generateHeatmapDays = () => {
    const days = [];
    const today = new Date();
    
    // Go back 119 days to make it a total of 120 days (approx 17 weeks)
    for (let i = 119; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();
  const heatmapLogs = data?.heatmapData || [];

  const getHeatmapColor = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayLogs = heatmapLogs.filter((log: any) => log.date === dateStr);

    if (dayLogs.length === 0) {
      return 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-900'; // No log
    }

    // Determine status (take first log status or priority status)
    const statuses = dayLogs.map((l: any) => l.status);
    
    if (statuses.includes('absent')) return 'bg-red-500 border border-red-600';
    if (statuses.includes('present') || statuses.includes('lab')) return 'bg-emerald-500 border border-emerald-600';
    if (statuses.includes('holiday')) return 'bg-zinc-500 border border-zinc-600';
    if (statuses.includes('exam') || statuses.includes('internal')) return 'bg-purple-500 border border-purple-600';

    return 'bg-zinc-300';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Detailed Analytics</h2>
          <p className="text-sm text-zinc-500">Explore comprehensive trends, heatmaps, and attendance distributions.</p>
        </div>

        {/* Analytic Card highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase">Average Attendance</span>
                <h4 className="text-2xl font-bold">{summary.overallAttendance}%</h4>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <Activity className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase">Skipped Classes</span>
                <h4 className="text-2xl font-bold text-red-500">{summary.classesMissed}</h4>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase">Most Missed Subject</span>
                <h4 className="text-sm font-extrabold truncate max-w-[150px]">{summary.mostMissedSubject}</h4>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <Bookmark className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase">Skips Allowed</span>
                <h4 className="text-2xl font-bold text-emerald-500">{summary.totalSkipsAllowed}</h4>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Zap className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* 1. GitHub Style Heatmap Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-500" />
              Attendance Heatmap
            </CardTitle>
            <p className="text-xs text-zinc-400">Your daily attendance history over the last 120 days.</p>
          </CardHeader>
          <CardContent className="p-6 overflow-x-auto">
            
            {/* Heatmap Grid Wrapper */}
            <div className="min-w-[640px] space-y-4">
              
              {/* Box grid layout */}
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-start">
                {heatmapDays.map((day, idx) => (
                  <div
                    key={day.toDateString()}
                    className={`w-3.5 h-3.5 rounded-[3px] transition-colors ${getHeatmapColor(day)}`}
                    title={`${day.toLocaleDateString()}: ${
                      heatmapLogs.filter((l: any) => l.date === day.toISOString().split('T')[0]).map((l: any) => l.status).join(', ') || 'No log'
                    }`}
                  />
                ))}
              </div>

              {/* Legend keys */}
              <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
                    <span>No Lecture</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span>Present / Lab</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-zinc-500" />
                    <span>Holiday</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                    <span>Exam</span>
                  </div>
                </div>
                <span>Less ➔ More presence</span>
              </div>

            </div>

          </CardContent>
        </Card>

        {/* 2. Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Subject wise comparison */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-md">Course Comparison Metrics</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="percentage" name="Attendance Rate (%)" fill="#2563EB" radius={[8, 8, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly trend curve */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Attendance Trend Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data?.monthlyTrend || []}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCurve" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
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
                    <Area type="monotone" dataKey="percentage" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorCurve)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </DashboardLayout>
  );
}
