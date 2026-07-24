'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, Input, Button, Select, useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import { Calculator, Sparkles, Loader2, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CalculatorPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states - Bunk calculator
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [manualAttended, setManualAttended] = useState('');
  const [manualTotal, setManualTotal] = useState('');
  const [skipsPlanned, setSkipsPlanned] = useState('1');
  const [bunkResult, setBunkResult] = useState(null);

  // Form states - Target calculator
  const [targetSelectedId, setTargetSelectedId] = useState('');
  const [targetGoal, setTargetGoal] = useState('75');
  const [targetResult, setTargetResult] = useState(null);

  const fetchSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubjectId(data[0].id);
        setTargetSelectedId(data[0].id);
      }
    } catch (error) {
      toast(error.message || 'Failed to fetch subjects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCalculateBunk = () => {
    let attended = 0;
    let total = 0;
    let name = 'Manual Input';

    if (selectedSubjectId === 'manual') {
      attended = Number(manualAttended);
      total = Number(manualTotal);
      if (isNaN(attended) || isNaN(total) || total <= 0 || attended < 0 || attended > total) {
        toast('Please enter valid attended and total class counts.', 'error');
        return;
      }
    } else {
      const sub = subjects.find(s => s.id === selectedSubjectId);
      if (!sub) return;
      attended = sub.attendedClasses;
      total = sub.totalClasses;
      name = sub.subjectName;
    }

    const bunks = Number(skipsPlanned);
    if (isNaN(bunks) || bunks < 0) {
      toast('Please enter a valid number of bunks.', 'error');
      return;
    }

    const currentPercent = total > 0 ? (attended / total) * 100 : 100;
    const finalTotal = total + bunks;
    const finalPercent = finalTotal > 0 ? (attended / finalTotal) * 100 : 100;

    setBunkResult({
      subjectName: name,
      currentPercent: parseFloat(currentPercent.toFixed(1)),
      finalPercent: parseFloat(finalPercent.toFixed(1)),
      skipsPlanned: bunks,
      attended,
      finalTotal,
    });
  };

  const handleCalculateTarget = () => {
    let attended = 0;
    let total = 0;
    let name = 'Manual Input';

    if (targetSelectedId === 'manual') {
      attended = Number(manualAttended);
      total = Number(manualTotal);
      if (isNaN(attended) || isNaN(total) || total <= 0 || attended < 0 || attended > total) {
        toast('Please enter valid attended and total class counts (use Manual section above).', 'error');
        return;
      }
    } else {
      const sub = subjects.find(s => s.id === targetSelectedId);
      if (!sub) return;
      attended = sub.attendedClasses;
      total = sub.totalClasses;
      name = sub.subjectName;
    }

    const goal = Number(targetGoal);
    if (isNaN(goal) || goal <= 0 || goal > 100) {
      toast('Please enter a valid target goal between 1 and 100.', 'error');
      return;
    }

    const currentPercent = total > 0 ? (attended / total) * 100 : 100;
    const reqFraction = goal / 100;

    let classesNeeded = 0;
    if (currentPercent < goal) {
      if (reqFraction < 1) {
        classesNeeded = Math.ceil((reqFraction * total - attended) / (1 - reqFraction));
      } else {
        classesNeeded = 9999;
      }
    }

    setTargetResult({
      subjectName: name,
      currentPercent: parseFloat(currentPercent.toFixed(1)),
      goal,
      classesNeeded,
      attended,
      total,
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-zinc-500">Loading calculators...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const subjectOptions = [
    ...subjects.map(s => ({ value: s.id, label: s.subjectName })),
    { value: 'manual', label: 'Custom Manual Input' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Bunk & Target Calculators</h2>
          <p className="text-zinc-500 text-sm mt-0.5">Predict the impact of skipping lectures on your academic requirements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section: Bunk Impact Calculator */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Bunk Impact Predictor</h3>
              </div>

              <div className="space-y-4">
                <Select
                  label="Select Subject"
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setBunkResult(null);
                  }}
                  options={subjectOptions}
                />

                {selectedSubjectId === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Classes Attended"
                      type="number"
                      placeholder="e.g. 15"
                      value={manualAttended}
                      onChange={(e) => {
                        setManualAttended(e.target.value);
                        setBunkResult(null);
                      }}
                    />
                    <Input
                      label="Total Classes"
                      type="number"
                      placeholder="e.g. 20"
                      value={manualTotal}
                      onChange={(e) => {
                        setManualTotal(e.target.value);
                        setBunkResult(null);
                      }}
                    />
                  </div>
                )}

                <Input
                  label="Upcoming Classes to Skip (Bunk)"
                  type="number"
                  min="0"
                  value={skipsPlanned}
                  onChange={(e) => {
                    setSkipsPlanned(e.target.value);
                    setBunkResult(null);
                  }}
                />

                <Button onClick={handleCalculateBunk} variant="primary" className="w-full">
                  Calculate Bunk Impact
                </Button>
              </div>

              {bunkResult && (
                <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{bunkResult.subjectName} Prediction</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Current Percentage:</span>
                    <span className="font-extrabold">{bunkResult.currentPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">After Bunking {bunkResult.skipsPlanned} Classes:</span>
                    <span className={`font-extrabold ${bunkResult.finalPercent >= 75 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {bunkResult.finalPercent}%
                    </span>
                  </div>
                  {bunkResult.finalPercent < 75 && (
                    <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      Skipping these classes will pull you below the 75% critical limit.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section: Target Attendance Calculator */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Target Goal Calculator</h3>
              </div>

              <div className="space-y-4">
                <Select
                  label="Select Subject"
                  value={targetSelectedId}
                  onChange={(e) => {
                    setTargetSelectedId(e.target.value);
                    setTargetResult(null);
                  }}
                  options={subjectOptions}
                />

                {targetSelectedId === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Classes Attended"
                      type="number"
                      placeholder="e.g. 15"
                      value={manualAttended}
                      onChange={(e) => {
                        setManualAttended(e.target.value);
                        setTargetResult(null);
                      }}
                    />
                    <Input
                      label="Total Classes"
                      type="number"
                      placeholder="e.g. 25"
                      value={manualTotal}
                      onChange={(e) => {
                        setManualTotal(e.target.value);
                        setTargetResult(null);
                      }}
                    />
                  </div>
                )}

                <Input
                  label="Target Attendance Percentage Goal (%)"
                  type="number"
                  min="1"
                  max="100"
                  value={targetGoal}
                  onChange={(e) => {
                    setTargetGoal(e.target.value);
                    setTargetResult(null);
                  }}
                />

                <Button onClick={handleCalculateTarget} variant="primary" className="w-full">
                  Calculate Required Classes
                </Button>
              </div>

              {targetResult && (
                <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{targetResult.subjectName} Goal Prediction</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Current Percentage:</span>
                    <span className="font-extrabold">{targetResult.currentPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Target Goal:</span>
                    <span className="font-extrabold">{targetResult.goal}%</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-xs">
                    <span className="font-bold">Classes to attend back-to-back:</span>
                    <span className={`text-sm font-extrabold ${targetResult.classesNeeded > 0 ? 'text-indigo-500' : 'text-emerald-500'}`}>
                      {targetResult.classesNeeded}
                    </span>
                  </div>
                  {targetResult.classesNeeded === 0 && (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-bold">
                      You are already at or above your target goal! Keep it up.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>
    </DashboardLayout>
  );
}
