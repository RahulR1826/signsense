"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Hand, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/lib/store";
import ThemeToggle from "@/components/ThemeToggle";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    setLoading(true);
    // Simulate API registration call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    addNotification("Account Created!", "Registration was successful. Welcome to SignSense!", "success");
    router.push("/dashboard");
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--text-2)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--emerald)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass border border-[var(--glass-border)] py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[var(--text-2)] mb-2"
              >
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-3)]">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  {...register("name")}
                  className={`w-full bg-[var(--surface-2)] border ${
                    errors.name ? "border-red-500/50" : "border-[var(--border)]"
                  } rounded-xl pl-10 pr-3 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
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
                  placeholder="jane@example.com"
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--text-2)] mb-2"
              >
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-3)]">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full bg-[var(--surface-2)] border ${
                    errors.password ? "border-red-500/50" : "border-[var(--border)]"
                  } rounded-xl pl-10 pr-3 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 bg-[var(--surface-2)] border-[var(--border)] text-[var(--emerald)] rounded focus:ring-[var(--emerald)]"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-[var(--text-2)]">
                I agree to the{" "}
                <a href="#" className="text-[var(--emerald)] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[var(--emerald)] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    Register <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
