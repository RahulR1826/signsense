"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, MessageSquare, ArrowRight, Loader2, CheckCircle, User } from "lucide-react";
import { useNotificationStore } from "@/lib/store";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFields = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFields>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFields) => {
    setLoading(true);
    // Simulate contact form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSuccess(true);
    addNotification("Message Received", "We have received your request and will contact you shortly.", "success");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-xl mx-auto space-y-10 dot-grid">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[var(--emerald)] uppercase tracking-wider block">
            Get in touch
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Contact Us
          </h2>
          <p className="text-base text-[var(--text-2)] leading-relaxed">
            Have questions about integrations or enterprise pricing? Drop us a note.
          </p>
        </div>

        <div className="glass border border-[var(--glass-border)] p-8 shadow-2xl rounded-3xl bg-[var(--surface)]/30">
          {!success ? (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-[var(--text-2)] mb-2">
                  Your Name
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-3)]">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register("name")}
                    className={`w-full bg-[var(--surface-2)] border ${
                      errors.name ? "border-red-500/50" : "border-[var(--border)]"
                    } rounded-xl pl-10 pr-3 py-2.5 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-[10px] text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-[var(--text-2)] mb-2">
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-3)]">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    className={`w-full bg-[var(--surface-2)] border ${
                      errors.email ? "border-red-500/50" : "border-[var(--border)]"
                    } rounded-xl pl-10 pr-3 py-2.5 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-[10px] text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-[var(--text-2)] mb-2">
                  Message Details
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 pt-3 flex items-start pointer-events-none text-[var(--text-3)]">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="How can we help your team?"
                    {...register("message")}
                    className={`w-full bg-[var(--surface-2)] border ${
                      errors.message ? "border-red-500/50" : "border-[var(--border)]"
                    } rounded-xl pl-10 pr-3 py-2.5 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--emerald)] transition-colors`}
                  />
                </div>
                {errors.message && (
                  <p className="mt-1.5 text-[10px] text-red-500">{errors.message.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" /> Sending message...
                    </>
                  ) : (
                    <>
                      Send Message <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-[var(--emerald)]" />
              </div>
              <h3 className="text-lg font-bold">Message Sent!</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Thank you for reaching out. A SignSense team member will contact you shortly.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
