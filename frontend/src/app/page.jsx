'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calculator,
  Calendar,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[150px]" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#111115_1px,transparent_1px),linear-gradient(to_bottom,#111115_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between border-b border-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">
            AttendSync
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-20 pb-32 flex flex-col items-center text-center relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 max-w-3xl"
        >
          {/* Tag */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-xs text-blue-400 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Empowering College Attendance Decisions
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent"
          >
            Never Ask <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-indigo-500 bg-clip-text text-transparent">
              "Can I Bunk Today?"
            </span> <br />
            Again.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Track your class attendance, project future attendance patterns, and make smarter academic decisions with visual predictions and real-time safe status calculation.
          </motion.p>

          {/* Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all active:scale-[0.98]"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-6 text-sm font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              Live Demo (Login)
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <section className="mt-40 space-y-12 w-full">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Everything you need to skip responsibly</h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Automated status indicators and prediction curves designed specifically for modern students.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md flex flex-col items-start text-left hover:border-zinc-800 transition-all duration-300">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Skip Calculator</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Instantly calculate how many upcoming classes you can skip without falling below the required percentage.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md flex flex-col items-start text-left hover:border-zinc-800 transition-all duration-300">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Predictive Analytics</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Project your final semester attendance by entering your remaining lectures and expected weekly presence.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md flex flex-col items-start text-left hover:border-zinc-800 transition-all duration-300">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Calendar</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Mark present, absent, exam, or lab logs directly on a monthly calendar grid. Includes contribution heatmap charts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md flex flex-col items-start text-left hover:border-zinc-800 transition-all duration-300">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Timetable Sync</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Keep a weekly Monday-to-Friday schedule. Click on time slots to log attendance instantly.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md flex flex-col items-start text-left hover:border-zinc-800 transition-all duration-300">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Printable Reports</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Generate clean, beautiful PDF and print-ready files summarizing your subject percentages.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md flex flex-col items-start text-left hover:border-zinc-800 transition-all duration-300">
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">JWT Security</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Secure encryption on your password and access token. Your attendance logs and timetable slots remain strictly private.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 py-12 border-t border-zinc-900/50 flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-xs gap-4">
        <span>© {new Date().getFullYear()} AttendSync. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Contact Support</a>
        </div>
      </footer>

    </div>
  );
}
