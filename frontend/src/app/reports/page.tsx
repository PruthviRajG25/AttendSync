'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, useToast, Button } from '../../components/ui/core';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Printer,
  Loader2,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      const analyticsData = await api.getAnalytics();
      const subjectsData = await api.getSubjects();
      setData(analyticsData);
      setSubjects(subjectsData);
    } catch (error: any) {
      toast(error.message || 'Error compiling reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
    attendanceGoal: 75
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header - Hidden during print */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Reports</h2>
            <p className="text-sm text-zinc-500">Compile and export your official semester attendance sheets to PDF.</p>
          </div>
          <Button onClick={handlePrint} className="flex items-center gap-1.5 py-2.5 rounded-xl">
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>

        {/* Printable Sheet */}
        <Card className="border border-zinc-200 dark:border-zinc-800 print:border-none print:shadow-none bg-white dark:bg-zinc-950/40">
          <CardContent className="p-8 space-y-8 print:p-0">
            
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-900">
              <div className="space-y-1">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent print:text-black">
                  AttendSync Report
                </span>
                <p className="text-xs text-zinc-400">Generated on {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-left sm:text-right text-xs space-y-1">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 print:text-black">Student Details</h4>
                <p className="text-zinc-500">{user?.name}</p>
                {user?.college && <p className="text-zinc-500">{user.college}</p>}
                {user?.branch && (
                  <p className="text-zinc-500">
                    {user.branch} {user.semester ? `(Semester ${user.semester})` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Semester statistics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900 print:bg-zinc-50 print:border-zinc-200">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Overall Attendance</span>
                <span className="text-2xl font-extrabold mt-1 block text-zinc-800 dark:text-zinc-100 print:text-black">
                  {summary.overallAttendance}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900 print:bg-zinc-50 print:border-zinc-200">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Min Goal Target</span>
                <span className="text-2xl font-extrabold mt-1 block text-blue-500 print:text-blue-600">
                  {summary.attendanceGoal}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900 print:bg-zinc-50 print:border-zinc-200">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Total Conducted</span>
                <span className="text-2xl font-extrabold mt-1 block text-zinc-800 dark:text-zinc-100 print:text-black">
                  {summary.totalClasses} classes
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900 print:bg-zinc-50 print:border-zinc-200">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Classes Skipped</span>
                <span className="text-2xl font-extrabold mt-1 block text-red-500 print:text-red-600">
                  {summary.classesMissed} classes
                </span>
              </div>
            </div>

            {/* Subjects Breakdown Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-50 dark:border-zinc-900/50 pb-2 print:text-black print:border-zinc-300">
                Subject-wise Breakdown
              </h3>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900 text-zinc-400 font-bold">
                      <th className="py-2.5">Subject Name</th>
                      <th className="py-2.5">Faculty Name</th>
                      <th className="py-2.5 text-center">Attended</th>
                      <th className="py-2.5 text-center">Total classes</th>
                      <th className="py-2.5 text-right">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/30">
                    {subjects.map((sub) => (
                      <tr key={sub.id} className="text-zinc-700 dark:text-zinc-300 print:text-black">
                        <td className="py-3 font-semibold">{sub.subjectName}</td>
                        <td className="py-3 text-zinc-500 print:text-zinc-700">{sub.facultyName || '—'}</td>
                        <td className="py-3 text-center">{sub.attendedClasses}</td>
                        <td className="py-3 text-center">{sub.totalClasses}</td>
                        <td className="py-3 text-right font-extrabold" style={{ color: sub.color || '#000' }}>
                          {sub.currentPercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 text-center text-[10px] text-zinc-400 font-medium print:text-zinc-600">
              AttendSync is a private college attendance prediction and planning dashboard. This report serves for personal planning records and does not substitute college ERP values.
            </div>

          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
