"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Mic,
  Volume2,
  Stethoscope,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";
import ToneDiscrimination from "@/components/ToneDiscrimination";
import DdkCoach from "@/components/DdkCoach";
import MptCoach from "@/components/MptCoach";
import AlphabetCoach from "@/components/AlphabetCoach";
import ArticuloLogo from "@/components/ArticuloLogo";

export default function Home() {
  const [demoExercise, setDemoExercise] = useState<"alphabet" | "mpt" | "ddk" | "tone">("alphabet");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-12 pb-20 lg:pt-18 lg:pb-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Centered Brand Logo */}
            <div className="mb-8 flex justify-center">
              <ArticuloLogo variant="full" size="lg" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E2453]/5 border border-[#0E2453]/15 text-[#0E2453] text-xs font-bold tracking-wide uppercase mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#33B0AA]" />
              Digital Speech & Auditory Rehabilitation Platform
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0E2453] tracking-tight leading-tight">
              Clinical Voice Therapy, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33B0AA] via-[#3980BE] to-[#DC8357]">
                Prescribed & Tracked at Home
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Articulo empowers speech-language pathologists (SLPs) and patients with real-time acoustic
              biofeedback, custom clinical prescriptions, and objective vocal tracking.
            </p>

            {/* Dual Portal CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/patient"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0E2453] hover:bg-[#163678] text-white font-extrabold text-sm shadow-xl shadow-[#0E2453]/25 transition-all flex items-center justify-center gap-2.5 group"
              >
                <User className="w-4 h-4 text-[#33B0AA]" />
                <span>Launch Patient Portal</span>
                <ArrowRight className="w-4 h-4 text-[#FD903B] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/therapist"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-[#0E2453] font-extrabold text-sm border-2 border-slate-200 hover:border-[#3980BE] shadow-sm transition-all flex items-center justify-center gap-2.5"
              >
                <Stethoscope className="w-4 h-4 text-[#3980BE]" />
                <span>Clinician Dashboard</span>
              </Link>
            </div>

            {/* Verification & Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-bold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#33B0AA]" /> Web Audio Biofeedback
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#3980BE]" /> SLP Prescriptions
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#DC8357]" /> Diadochokinetic SMR/AMR
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Care Flow with Soundwave Color Palette */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#3980BE]">
              The Connected Care Workflow
            </h2>
            <p className="text-3xl font-black text-[#0E2453] mt-2">
              How Articulo Coordinates Voice Rehabilitation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200/80 relative hover:border-[#33B0AA]/50 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#33B0AA]/15 text-[#33B0AA] font-black text-xl flex items-center justify-center mb-6 border border-[#33B0AA]/30">
                1
              </div>
              <h3 className="text-lg font-bold text-[#0E2453] mb-2">Therapist Prescribes</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The clinician selects targeted motor speech and vocal exercises, customized goals
                (e.g., target 15s MPT, 4.0 reps/sec), frequency, and clinical notes.
              </p>
            </div>

            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200/80 relative hover:border-[#3980BE]/50 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#3980BE]/15 text-[#3980BE] font-black text-xl flex items-center justify-center mb-6 border border-[#3980BE]/30">
                2
              </div>
              <h3 className="text-lg font-bold text-[#0E2453] mb-2">Patient Practices</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The patient logs into their portal to view today’s queue. Real-time microphone acoustic
                analysis and visual timers guide precise phonation at home.
              </p>
            </div>

            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200/80 relative hover:border-[#DC8357]/50 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#DC8357]/15 text-[#DC8357] font-black text-xl flex items-center justify-center mb-6 border border-[#DC8357]/30">
                3
              </div>
              <h3 className="text-lg font-bold text-[#0E2453] mb-2">Progress Telemetry</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Repetition rates, sustained phonation durations, and daily adherence streaks are
                automatically logged and visible to the treating therapist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Clinical Exercise Sandbox */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#3980BE]">
              Interactive Clinical Modules
            </h2>
            <p className="text-3xl font-black text-[#0E2453] mt-2">
              Test Articulo’s Core Drills
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Try out the acoustic biofeedback engine directly in your browser.
            </p>

            {/* Exercise Switcher Tabs */}
            <div className="inline-flex flex-wrap justify-center rounded-2xl bg-slate-200/80 p-1.5 mt-6 gap-1.5 shadow-2xs">
              <button
                onClick={() => setDemoExercise("alphabet")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                  demoExercise === "alphabet"
                    ? "bg-[#0E2453] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0E2453]"
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#DC8357]" /> Alphabet A–Z
              </button>
              <button
                onClick={() => setDemoExercise("mpt")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                  demoExercise === "mpt"
                    ? "bg-[#0E2453] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0E2453]"
                }`}
              >
                <Mic className="w-4 h-4 text-[#33B0AA]" /> MPT Phonation
              </button>
              <button
                onClick={() => setDemoExercise("ddk")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                  demoExercise === "ddk"
                    ? "bg-[#0E2453] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0E2453]"
                }`}
              >
                <Activity className="w-4 h-4 text-[#FD903B]" /> DDK Motor Pacing
              </button>
              <button
                onClick={() => setDemoExercise("tone")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                  demoExercise === "tone"
                    ? "bg-[#0E2453] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0E2453]"
                }`}
              >
                <Volume2 className="w-4 h-4 text-[#3980BE]" /> Pitch Match
              </button>
            </div>
          </div>

          {/* Active Interactive Component */}
          <div className="mt-8">
            {demoExercise === "alphabet" && <AlphabetCoach />}
            {demoExercise === "mpt" && <MptCoach />}
            {demoExercise === "ddk" && <DdkCoach />}
            {demoExercise === "tone" && <ToneDiscrimination />}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <ArticuloLogo variant="horizontal" size="sm" />
          <div className="flex gap-6 font-bold">
            <Link href="/patient" className="text-slate-600 hover:text-[#0E2453] transition">
              Patient Portal
            </Link>
            <Link href="/therapist" className="text-slate-600 hover:text-[#0E2453] transition">
              Therapist Portal
            </Link>
          </div>
          <span className="text-[11px] text-slate-400">
            © 2026 Articulo Speech and Hearing. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}