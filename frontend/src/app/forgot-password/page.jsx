'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, useToast } from '../../components/ui/core';
import { api } from '../../lib/api';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required.');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await api.forgotPassword({ email });
      setSuccess(true);
      toast(data.message || 'Reset link sent successfully.', 'success');
    } catch (err) {
      toast(err.message || 'Request failed.', 'error');
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
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Enter your registered email to request a reset link</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                Reset link sent! Please check your inbox for instructions.
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in page
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="relative">
                <Mail className="absolute left-3 top-[34px] w-4.5 h-4.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                <Input
                  label="Email Address"
                  placeholder="you@university.edu"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
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
                    Send Reset Link
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>

            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
