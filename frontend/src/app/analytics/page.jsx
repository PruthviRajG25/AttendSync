'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Award, Clock, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const analytics = await api.getAnalytics();
      setData(analytics);
    } catch (error) {
      toast(error.message || 'Failed to fetch analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Generate date array for 16-week calendar grid aligned to Sunday
  const getHeatmapGrid = () => {
    const grid = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 15 * 7 - today.getDay());

    for (let dayOffset = 0; dayOffset < 16 * 7; dayOffset++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + dayOffset);
      grid.push(d);
    }
    return grid;
  };

  const getDayStatusColor = (day) => {
    if (!data || !data.heatmapData) return 'bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200/10 dark:border-zinc-800/10';
    const dateStr = day.toISOString().split('T')[0];
    const dayLogs = data.heatmapData.filter((d) => d.date === dateStr);

    if (dayLogs.length === 0) {
      return 'bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200/10 dark:border-zinc-800/10';
    }

    const hasAbsent = dayLogs.some((l) => l.status === 'absent');
    const hasPresent = dayLogs.some((l) => l.status === 'present' || l.status === 'lab');
    const hasOther = dayLogs.some((l) => ['holiday', 'exam', 'internal'].includes(l.status));

    if (hasAbsent) {
      return 'bg-red-500 dark:bg-red-600 border border-red-500/20';
    }
    if (hasPresent) {
      return 'bg-emerald-500 dark:bg-emerald-600 border border-emerald-500/20';
    }
    if (hasOther) {
      return 'bg-zinc-300 dark:bg-zinc-700 border border-zinc-300/20';
    }
    return 'bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200/10 dark:border-zinc-800/10';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-zinc-500">Generating analytics...</span>
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Predictive Analytics</h2>
          <p className="text-zinc-500 text-sm mt-0.5">Explore historic attendance levels and skip safety indices</p>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-2xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Overall Attendance</span>
                <p className="text-2xl font-extrabold">{summary.overallAttendance}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-2xl">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Classes Logged</span>
                <p className="text-2xl font-extrabold">{summary.classesAttended} / {summary.totalClasses}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Feasible Skips</span>
                <p className="text-2xl font-extrabold">{summary.totalSkipsAllowed} Bunks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Monthly Trend Chart */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Monthly Attendance Progression</h3>
                <p className="text-[11px] text-zinc-400">Tracking aggregate levels across past billing months</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyTrend || []}>
                    <defs>
                      <linearGradient id="colorMonthPercent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a10" className="dark:stroke-zinc-800/20" />
                    <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip
                      contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="percentage" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMonthPercent)" name="Attendance" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Subject Wise Percentage Breakdown */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Subject Performance Index</h3>
                <p className="text-[11px] text-zinc-400">Course percentages vs. minimum attendance targets</p>
              </div>
              <div className="h-64 w-full">
                {summary.totalSubjects === 0 ? (
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
                      />
                      <Bar dataKey="percentage" radius={[10, 10, 0, 0]} name="My Attendance">
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

        {/* Detailed Percentages & Heatmap Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List Section: Subjectwise Attendance in % */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Subject Percentages</h3>
                <p className="text-[11px] text-zinc-400">Actual values and progress bars</p>
              </div>

              <div className="space-y-4">
                {summary.totalSubjects === 0 ? (
                  <p className="text-xs text-zinc-400 py-6 text-center">No subjects created yet.</p>
                ) : (
                  (data?.subjectWiseAttendance || []).map((sub) => (
                    <div key={sub.subjectName} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[75%]">{sub.subjectName}</span>
                        <span className="font-extrabold" style={{ color: sub.color }}>{sub.percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${sub.percentage}%`, backgroundColor: sub.color }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Heatmap Section */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Attendance Activity Heatmap</h3>
                <p className="text-[11px] text-zinc-400"> Activity tracking grid (last 16 weeks)</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-center overflow-x-auto py-2">
                  
                  {/* Row Labels (Mon, Wed, Fri) */}
                  <div className="flex flex-col justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-600 h-28 pr-2 py-1 select-none">
                    <span>Sun</span>
                    <span>Tue</span>
                    <span>Thu</span>
                    <span>Sat</span>
                  </div>

                  {/* Heatmap grid */}
                  <div className="grid grid-flow-col grid-rows-7 gap-1 px-1">
                    {getHeatmapGrid().map((day, idx) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const dayLogs = data?.heatmapData?.filter((d) => d.date === dateStr) || [];
                      
                      let logTooltip = `${day.toLocaleDateString('en-US', { dateStyle: 'medium' })}: No logs`;
                      if (dayLogs.length > 0) {
                        logTooltip = `${day.toLocaleDateString('en-US', { dateStyle: 'medium' })}:\n` + 
                          dayLogs.map((l) => `• ${l.subjectName} (${l.status})`).join('\n');
                      }

                      return (
                        <div
                          key={`heat-${idx}`}
                          title={logTooltip}
                          className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer ${getDayStatusColor(day)}`}
                        />
                      );
                    })}
                  </div>

                </div>

                {/* Legend key */}
                <div className="flex justify-end items-center gap-3 text-[10px] font-semibold text-zinc-500 pr-2">
                  <span>Less</span>
                  <div className="w-3.5 h-3.5 rounded-sm bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200/10 dark:border-zinc-800/10" title="No logs" />
                  <div className="w-3.5 h-3.5 rounded-sm bg-zinc-300 dark:bg-zinc-700" title="Holiday/Other" />
                  <div className="w-3.5 h-3.5 rounded-sm bg-red-500" title="Absent logged" />
                  <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500" title="Present logged" />
                  <span>More</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </DashboardLayout>
  );
}
