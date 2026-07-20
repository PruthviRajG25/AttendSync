'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast, Button, Input, Card, CardHeader, CardTitle, CardContent } from '../../components/ui/core';
import { api } from '../../lib/api';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    if (!email) return;
    setLoading(true);
    try {
      await api.forgotPassword({ email });
      setSuccess(true);
      toast('Reset instructions sent to your email.', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to send reset link.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4 relative selection:bg-blue-500/20">
      <div className="absolute top-1/4 left-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[80px]" />
      
      <div className="w-full max-w-md space-y-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Link>

        <Card>
          <CardHeader className="text-center pt-8 border-none">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1">Enter your registered email address to receive reset instructions</p>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-2">
            {success ? (
              <div className="space-y-4 text-center">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  Password reset link sent! Check your inbox for instructions.
                </div>
                <p className="text-xs text-zinc-400">
                  (Demo Mode: You can sign in with your password, or sign up with a new email to continue.)
                </p>
                <Link href="/login" className="inline-block mt-4 text-sm text-blue-500 hover:underline">
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button type="submit" className="w-full py-2.5 mt-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending reset link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
