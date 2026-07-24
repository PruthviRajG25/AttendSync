'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, Button, useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import { Printer, FileSpreadsheet, Loader2, Sparkles } from 'lucide-react';

export default function ReportsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportsData = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (error) {
      toast(error.message || 'Error compiling reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-zinc-500">Compiling report data...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex justify-between items-center print:hidden">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Attendance Reports</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Generate printable PDF formats of semester statistics</p>
          </div>
          {subjects.length > 0 && (
            <Button
              onClick={handlePrint}
              variant="primary"
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
          )}
        </div>

        {/* Printable Card Frame */}
        <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/80 p-6 md:p-8">
          <CardContent className="p-0 space-y-8">
            
            {/* Report Header (Seen during print) */}
            <div className="text-center pb-6 border-b border-zinc-100 dark:border-zinc-900">
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">AttendSync Semestral Report</h1>
              <p className="text-xs text-zinc-500 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Table representation */}
            {subjects.length === 0 ? (
              <p className="text-xs text-zinc-400 py-12 text-center">No subjects created yet. Add subjects to generate reports.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Subject Name</th>
                      <th className="py-3 px-4">Faculty</th>
                      <th className="py-3 px-4 text-center">Classes Attended</th>
                      <th className="py-3 px-4 text-center">Total Held</th>
                      <th className="py-3 px-4 text-center">Min. Required</th>
                      <th className="py-3 px-4 text-center">Percentage</th>
                      <th className="py-3 px-4 text-center">Feasible Bunks</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub) => (
                      <tr
                        key={sub.id}
                        className="border-b border-zinc-50 dark:border-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
                          {sub.subjectName}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500">{sub.facultyName || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-center font-semibold">{sub.attendedClasses}</td>
                        <td className="py-3.5 px-4 text-center font-semibold">{sub.totalClasses}</td>
                        <td className="py-3.5 px-4 text-center font-semibold">{sub.minimumAttendance}%</td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-zinc-800 dark:text-zinc-200">
                          {sub.currentPercent}%
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-500">
                          {sub.classesCanSkip > 0 ? sub.classesCanSkip : '0'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                              sub.status === 'Safe'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : sub.status === 'Warning'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Report Footer */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-[10px] text-zinc-400">
              <span>System calculated using AttendSync Predictor APIs</span>
              <span>Student Authorized Signature: _______________________</span>
            </div>

          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
