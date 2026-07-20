'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, useToast, Button, Input } from '../../components/ui/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function CalculatorPage() {
  const [attended, setAttended] = useState<number>(15);
  const [total, setTotal] = useState<number>(20);
  const [target, setTarget] = useState<number>(75);
  
  // Results states
  const [results, setResults] = useState({
    percentage: 75,
    skips: 0,
    needed: 0,
    safe: true
  });

  const calculate = () => {
    const a = Number(attended);
    const t = Number(total);
    const r = Number(target);

    if (t === 0) {
      setResults({ percentage: 100, skips: 0, needed: 0, safe: true });
      return;
    }

    const currentPercent = (a / t) * 100;
    const reqFraction = r / 100;

    let skips = 0;
    let needed = 0;

    if (currentPercent >= r) {
      if (reqFraction > 0) {
        skips = Math.floor(a / reqFraction - t);
        if (skips < 0) skips = 0;
      }
    } else {
      if (reqFraction < 1) {
        needed = Math.ceil((reqFraction * t - a) / (1 - reqFraction));
      } else {
        needed = 999;
      }
    }

    setResults({
      percentage: parseFloat(currentPercent.toFixed(1)),
      skips,
      needed,
      safe: skips > 0
    });
  };

  useEffect(() => {
    calculate();
  }, [attended, total, target]);

  const handleReset = () => {
    setAttended(15);
    setTotal(20);
    setTarget(75);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Attendance Calculator</h2>
          <p className="text-sm text-zinc-500">Run manual predictions and check skipping safety metrics instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Inputs Card */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="text-md font-bold flex items-center gap-2 border-b border-zinc-50 dark:border-zinc-900 pb-3">
                <Calculator className="w-4.5 h-4.5 text-blue-500" />
                Calculator Inputs
              </h3>

              <div className="space-y-4">
                <Input
                  label="Classes Attended"
                  type="number"
                  min={0}
                  value={attended}
                  onChange={(e) => setAttended(Math.max(0, Number(e.target.value)))}
                />

                <Input
                  label="Total Classes conducted"
                  type="number"
                  min={Math.max(1, attended)}
                  value={total}
                  onChange={(e) => setTotal(Math.max(Number(e.target.value), attended))}
                />

                <Input
                  label="Required Attendance Percentage (%)"
                  type="number"
                  min={1}
                  max={100}
                  value={target}
                  onChange={(e) => setTarget(Math.min(100, Math.max(1, Number(e.target.value))))}
                />
              </div>

              <div className="pt-2">
                <Button onClick={handleReset} variant="secondary" className="w-full flex items-center gap-1.5 py-2.5 rounded-xl">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Defaults
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Outputs Panel with custom animations */}
          <div className="space-y-6">
            
            {/* Safe Status Card */}
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
            >
              <Card className={`overflow-hidden border-2 ${results.safe && results.skips > 0 ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                <CardContent className="p-8 text-center flex flex-col items-center gap-4">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Safe To Skip Today?
                  </span>
                  
                  <AnimatePresence mode="wait">
                    {results.safe && results.skips > 0 ? (
                      <motion.div
                        key="safe-yes"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                        <span className="text-4xl font-extrabold text-emerald-500 tracking-tight">YES</span>
                        <p className="text-xs text-zinc-500 max-w-xs mt-1">
                          You are above your goal. Skipping a class today keeps you in the safe zone!
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="safe-no"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <XCircle className="w-16 h-16 text-red-500" />
                        <span className="text-4xl font-extrabold text-red-500 tracking-tight">NO</span>
                        <p className="text-xs text-zinc-500 max-w-xs mt-1">
                          Skipping classes now will drop you below your {target}% requirement. Attend today!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Calculations metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <Card>
                <CardContent className="p-5 flex flex-col justify-between h-28">
                  <span className="text-xs font-bold text-zinc-400">Current Rate</span>
                  <div>
                    <span className="text-2xl font-extrabold tracking-tight">{results.percentage}%</span>
                    <p className="text-[10px] text-zinc-500 mt-1">Attended classes ratio</p>
                  </div>
                </CardContent>
              </Card>

              {results.safe && results.skips > 0 ? (
                <Card className="border-emerald-500/10 bg-emerald-500/5">
                  <CardContent className="p-5 flex flex-col justify-between h-28">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Classes You Can Skip</span>
                    <div>
                      <span className="text-3xl font-extrabold tracking-tight text-emerald-500">{results.skips}</span>
                      <p className="text-[10px] text-zinc-500 mt-1">Consecutive skips allowed</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-red-500/10 bg-red-500/5">
                  <CardContent className="p-5 flex flex-col justify-between h-28">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">Classes Needed To Reach Goal</span>
                    <div>
                      <span className="text-3xl font-extrabold tracking-tight text-red-500">{results.needed}</span>
                      <p className="text-[10px] text-zinc-500 mt-1">Consecutive classes to attend</p>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
