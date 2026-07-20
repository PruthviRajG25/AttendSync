'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast, Button, Input, Card, CardHeader, CardTitle, CardContent } from '../../components/ui/core';
import { api } from '../../lib/api';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      toast('Login successful! Redirecting...', 'success');
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      toast(err.message || 'Login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4 relative selection:bg-blue-500/20">
      
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[80px]" />
      
      <div className="w-full max-w-md space-y-6">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

        <Card>
          <CardHeader className="text-center pt-8 border-none flex flex-col items-center">
            <img src="/logo.png" alt="AttendSync Logo" className="w-16 h-16 rounded-2xl object-contain mb-3 shadow-lg shadow-blue-500/10 border border-zinc-200/20 dark:border-zinc-800/40" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              Welcome back
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1">Enter credentials to access your AttendSync account</p>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="p-3 text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="you@college.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                label={
                  <div className="flex justify-between items-center w-full">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Password</label>
                    <Link href="/forgot-password" className="text-xs text-blue-500 hover:underline font-normal">
                      Forgot password?
                    </Link>
                  </div>
                }
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <Button type="submit" className="w-full py-2.5 mt-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

            </form>

            <div className="mt-6 text-center text-xs text-zinc-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-500 font-semibold hover:underline">
                Create one now
              </Link>
            </div>

          </CardContent>
        </Card>
      </div>

    </div>
  );
}
