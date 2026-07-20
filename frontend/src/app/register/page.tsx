'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast, Button, Input, Card, CardHeader, CardTitle, CardContent } from '../../components/ui/core';
import { api } from '../../lib/api';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    semester: 1,
    branch: '',
    attendanceGoal: 75,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'semester' || name === 'attendanceGoal' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api.register(formData);
      toast('Registration successful! Welcome to AttendSync.', 'success');
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      toast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4 relative selection:bg-blue-500/20">
      
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[80px]" />
      
      <div className="w-full max-w-lg space-y-6">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

        <Card>
          <CardHeader className="text-center pt-8 border-none flex flex-col items-center">
            <img src="/logo.png" alt="AttendSync Logo" className="w-16 h-16 rounded-2xl object-contain mb-3 shadow-lg shadow-blue-500/10 border border-zinc-200/20 dark:border-zinc-800/40" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              Create an account
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1">Start tracking your attendance and planning skips responsibly</p>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="p-3 text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email Address *"
                  name="email"
                  type="email"
                  placeholder="john@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password *"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <Input
                  label="College / University"
                  name="college"
                  placeholder="State Tech University"
                  value={formData.college}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Semester"
                  name="semester"
                  type="number"
                  min={1}
                  max={12}
                  value={formData.semester}
                  onChange={handleChange}
                />
                <Input
                  label="Branch / Major"
                  name="branch"
                  placeholder="CSE / Mechanical"
                  value={formData.branch}
                  onChange={handleChange}
                />
                <Input
                  label="Attendance Goal (%)"
                  name="attendanceGoal"
                  type="number"
                  min={50}
                  max={100}
                  value={formData.attendanceGoal}
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" className="w-full py-2.5 mt-4" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Registering account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

            </form>

            <div className="mt-6 text-center text-xs text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 font-semibold hover:underline">
                Sign in
              </Link>
            </div>

          </CardContent>
        </Card>
      </div>

    </div>
  );
}
