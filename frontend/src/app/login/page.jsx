'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '../../components/ui/core';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await api.login({ email, password });
      toast('Login successful! Redirecting...', 'success');
      login(data.token, data.user);
    } catch (err) {
      toast(err.message || 'Login failed. Please check your credentials.', 'error');
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
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Enter your details to access your dashboard</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
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

            <div className="flex items-center justify-end text-xs">
              <Link
                href="/forgot-password"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot your password?
              </Link>
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
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

          </form>

          <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
