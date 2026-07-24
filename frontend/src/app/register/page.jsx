'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '../../components/ui/core';
import Link from 'next/link';
import { ArrowRight, User, Mail, Lock, Sparkles, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attendanceGoal, setAttendanceGoal] = useState('75');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Guard: if already logged in, redirect to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    const goal = Number(attendanceGoal);
    if (!attendanceGoal) {
      newErrors.attendanceGoal = 'Attendance goal is required.';
    } else if (isNaN(goal) || goal < 0 || goal > 100) {
      newErrors.attendanceGoal = 'Goal must be a number between 0 and 100.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await api.register({
        name,
        email,
        password,
        attendanceGoal: Number(attendanceGoal)
      });
      toast('Registration successful! Logging you in...', 'success');
      login(data.token, data.user);
    } catch (err) {
      toast(err.message || 'Registration failed. Email might be already in use.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-black relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />

      <Card className="w-full max-w-md border-zinc-200/60 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80">
        <CardHeader className="text-center pt-8 border-b-0">
          <Link href="/" className="inline-block text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent mb-2">
            AttendSync
          </Link>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Get started with attendance tracking and bunk predicting</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="relative">
              <User className="absolute left-3 top-[34px] w-4.5 h-4.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <Input
                label="Full Name"
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-[34px] w-4.5 h-4.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <Input
                label="Email Address"
                placeholder="you@university.edu"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-[34px] w-4.5 h-4.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Sparkles className="absolute left-3 top-[34px] w-4.5 h-4.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <Input
                label="Required Attendance Goal (%)"
                placeholder="75"
                type="number"
                value={attendanceGoal}
                onChange={(e) => setAttendanceGoal(e.target.value)}
                error={errors.attendanceGoal}
                className="pl-10"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

          </form>

          <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
