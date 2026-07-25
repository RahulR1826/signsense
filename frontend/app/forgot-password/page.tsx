"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Hand, Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { useNotificationStore } from "@/lib/store";
import ThemeToggle from "@/components/ThemeToggle";

const forgotSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ForgotFields = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFields>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFields) => {
    setLoading(true);
    // Simulate recovery email send
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSuccess(true);
    addNotification("Reset Link Sent", "If the email exists, a password reset link has been sent.", "success");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative dot-grid">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Hand className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[var(--text-1)]">SignSense</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-1)]">
          Reset password
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--text-2)]">
          Or{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--emerald)] hover:underline"
          >
            back to login
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass border border-[var(--glass-border)] py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {!success ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <p className="text-xs text-[var(--text-2)] mb-4 leading-relaxed">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--text-2)] mb-2"
                >
                  Email address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-3)]">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className={`w-full bg-[var(--surface-2)] border ${
                      errors.email ? "border-red-500/50" : "border-[var(--border)]"
                    } rounded-xl pl-10 pr-3 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" /> Sending Link...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-[var(--emerald)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-1)]">Check your email</h3>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">
                We've sent a password reset link to your email address if it exists in our system.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="btn-ghost px-5 py-2.5 text-xs rounded-xl inline-block"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
