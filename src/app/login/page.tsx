"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Stethoscope,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Activity,
} from "lucide-react";
import ArticuloLogo, { SoundwaveIcon } from "@/components/ArticuloLogo";
import {
  getStoredPatients,
  loginAsPatient,
  loginAsTherapist,
  getAuthSession,
} from "@/lib/store";
import { Patient, UserRole, AuthSession } from "@/lib/types";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [role, setRole] = useState<UserRole>(
    roleParam === "therapist" ? "therapist" : "patient"
  );
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(null);

  // Patient login form state
  const [selectedPatientId, setSelectedPatientId] = useState<string>("p1");
  const [patientEmail, setPatientEmail] = useState<string>(
    "elena.rostova@patient.articulo.org"
  );
  const [patientCode, setPatientCode] = useState<string>("ELENA-2026");

  // Therapist login form state
  const [therapistEmail, setTherapistEmail] = useState<string>(
    "rachel.vance@clinic.articulo.org"
  );
  const [therapistLicense, setTherapistLicense] = useState<string>("CCC-SLP #94820");
  const [therapistPassword, setTherapistPassword] = useState<string>("articulo-clinical");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const list = getStoredPatients();
      setPatients(list);
      setCurrentSession(getAuthSession());
    };
    sync();
    window.addEventListener("articulo-storage-update", sync);
    return () => window.removeEventListener("articulo-storage-update", sync);
  }, []);

  const handleSelectPatientPreset = (p: Patient) => {
    setSelectedPatientId(p.id);
    setPatientEmail(
      p.email || `${p.name.toLowerCase().replace(/\s+/g, ".")}@patient.articulo.org`
    );
    setPatientCode(p.accessCode || "ARTICULO-2026");
    setErrorMsg(null);
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Match by email, access code, or selected preset
    const matched =
      patients.find(
        (p) =>
          p.email?.toLowerCase() === patientEmail.trim().toLowerCase() ||
          p.accessCode?.toLowerCase() === patientCode.trim().toLowerCase() ||
          p.id === selectedPatientId
      ) || patients[0];

    if (!matched) {
      setErrorMsg("Unable to locate patient record. Please select a demo profile below.");
      return;
    }

    loginAsPatient(matched.id);
    router.push("/patient");
  };

  const handleQuickPatientLogin = (patientId: string) => {
    loginAsPatient(patientId);
    router.push("/patient");
  };

  const handleTherapistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!therapistEmail.trim()) {
      setErrorMsg("Please enter a valid clinician email.");
      return;
    }

    loginAsTherapist(therapistEmail.trim(), "Dr. Rachel Vance, CCC-SLP");
    router.push("/therapist");
  };

  const handleQuickTherapistLogin = () => {
    loginAsTherapist("rachel.vance@clinic.articulo.org", "Dr. Rachel Vance, CCC-SLP");
    router.push("/therapist");
  };

  return (
    <div className="flex-1 bg-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Active Session Banner if already signed in */}
        {currentSession && (
          <div className="mb-8 p-4 rounded-2xl bg-[#33B0AA]/10 border border-[#33B0AA]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#33B0AA] shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#0E2453]">
                  Currently signed in as {currentSession.name}
                </span>{" "}
                <span className="text-slate-600">
                  ({currentSession.role === "patient" ? "Patient Portal" : "Therapist Portal"})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                router.push(currentSession.role === "patient" ? "/patient" : "/therapist")
              }
              className="px-4 py-2 rounded-xl bg-[#0E2453] text-white text-xs font-extrabold hover:bg-[#163678] transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              Continue to {currentSession.role === "patient" ? "Patient" : "Therapist"} Dashboard
              <ArrowRight className="w-3.5 h-3.5 text-[#FFA33E]" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-200 shadow-xl overflow-hidden bg-white">
          {/* Left Column: Brand & Role Context */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0E2453] via-[#132d66] to-[#0A1B3F] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Decorative Soundwave Watermark */}
            <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
              <SoundwaveIcon className="h-52 w-auto" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#33B0AA] text-[11px] font-extrabold uppercase tracking-wider mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFA33E]" /> HIPAA-Aligned Clinical Portal
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {role === "patient"
                  ? "Patient Speech & Voice Therapy Portal"
                  : "Clinician & SLP Management Portal"}
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-3">
                {role === "patient"
                  ? "Sign in to access your daily speech rehabilitation prescriptions, interactive biofeedback drills, and A–Z voice recording exercises assigned by your therapist."
                  : "Sign in to manage your active patient roster, prescribe custom acoustic targets (MPT, DDK, Pitch, Alphabet A–Z), and listen to patient voice recordings."}
              </p>

              {/* Feature Highlights for Selected Role */}
              <div className="mt-8 space-y-3.5 text-xs">
                {role === "patient" ? (
                  <>
                    <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                      <Activity className="w-4 h-4 text-[#33B0AA] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">
                          Prescribed Daily Therapy Drills
                        </span>
                        <span className="text-slate-300 text-[11px]">
                          View personalized instructions and target thresholds from your SLP.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                      <Sparkles className="w-4 h-4 text-[#FFA33E] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">
                          A–Z Voice Recording & Biofeedback
                        </span>
                        <span className="text-slate-300 text-[11px]">
                          Listen to reference audio prompts and record your voice for therapist review.
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                      <Stethoscope className="w-4 h-4 text-[#3980BE] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">
                          Custom Exercise Prescriptions
                        </span>
                        <span className="text-slate-300 text-[11px]">
                          Assign MPT, DDK, Pitch Match, and Alphabet A–Z drills to any patient.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                      <Activity className="w-4 h-4 text-[#FD903B] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">
                          Asynchronous Audio & Telemetry Review
                        </span>
                        <span className="text-slate-300 text-[11px]">
                          Play back recorded A–Z patient voice clips and track adherence streaks.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="relative z-10 pt-8 mt-8 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300">
              <span>Articulo Speech & Hearing</span>
              <span className="font-mono text-[#FFA33E]">v2.4 Clinical</span>
            </div>
          </div>

          {/* Right Column: Interactive Role Switcher & Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Brand Header */}
              <div className="flex items-center justify-between mb-6">
                <ArticuloLogo variant="horizontal" size="sm" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Account Authentication
                </span>
              </div>

              {/* Role Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setRole("patient");
                    setErrorMsg(null);
                  }}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                    role === "patient"
                      ? "bg-white text-[#0E2453] shadow-sm ring-1 ring-[#33B0AA]/40"
                      : "text-slate-600 hover:text-[#0E2453]"
                  }`}
                >
                  <User
                    className={`w-4 h-4 ${
                      role === "patient" ? "text-[#33B0AA]" : "text-slate-400"
                    }`}
                  />
                  Patient Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole("therapist");
                    setErrorMsg(null);
                  }}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                    role === "therapist"
                      ? "bg-white text-[#0E2453] shadow-sm ring-1 ring-[#3980BE]/40"
                      : "text-slate-600 hover:text-[#0E2453]"
                  }`}
                >
                  <Stethoscope
                    className={`w-4 h-4 ${
                      role === "therapist" ? "text-[#3980BE]" : "text-slate-400"
                    }`}
                  />
                  Therapist Login
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {role === "patient" ? (
                /* PATIENT LOGIN FORM */
                <div className="space-y-6">
                  {/* 1-Click Demo Patient Profiles */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Select Patient Profile (1-Click Demo Access)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {patients.map((p) => {
                        const isSelected = p.id === selectedPatientId;
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPatientPreset(p)}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                              isSelected
                                ? "border-[#33B0AA] bg-[#33B0AA]/10 ring-2 ring-[#33B0AA]/30"
                                : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={p.avatar}
                                alt={p.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-black text-[#0E2453] text-xs block truncate">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  {p.diagnosis.split("&")[0]}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickPatientLogin(p.id);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#0E2453] hover:bg-[#163678] text-white text-[10px] font-extrabold shrink-0 transition"
                            >
                              Instant Login
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <form onSubmit={handlePatientSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0E2453] uppercase tracking-wider mb-1">
                        Patient Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          placeholder="elena.rostova@patient.articulo.org"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#0E2453] focus:outline-none focus:ring-2 focus:ring-[#33B0AA]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0E2453] uppercase tracking-wider mb-1">
                        Patient Access Code / Password
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={patientCode}
                          onChange={(e) => setPatientCode(e.target.value)}
                          placeholder="e.g. ELENA-2026"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#0E2453] focus:outline-none focus:ring-2 focus:ring-[#33B0AA]"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Demo access codes: <code className="font-bold text-slate-600">ELENA-2026</code>{" "}
                        or <code className="font-bold text-slate-600">MARCUS-2026</code>
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-xl bg-[#33B0AA] hover:bg-[#2b9994] text-white font-black text-sm shadow-md shadow-[#33B0AA]/25 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Sign In to Patient Portal <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                /* THERAPIST LOGIN FORM */
                <div className="space-y-6">
                  {/* 1-Click Demo Clinician Profile */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Clinician Quick Access (1-Click Demo)
                    </label>
                    <div className="p-3.5 rounded-2xl border border-[#3980BE]/40 bg-[#3980BE]/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#0E2453] text-[#33B0AA] flex items-center justify-center shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-[#0E2453] text-xs block truncate">
                            Dr. Rachel Vance, CCC-SLP
                          </span>
                          <span className="text-[10px] text-slate-600 block truncate">
                            Clinical Director • License #SLP-94820
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleQuickTherapistLogin}
                        className="px-3 py-1.5 rounded-lg bg-[#0E2453] hover:bg-[#163678] text-white text-[10px] font-extrabold shrink-0 transition"
                      >
                        Instant Login
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleTherapistSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0E2453] uppercase tracking-wider mb-1">
                        Clinician Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={therapistEmail}
                          onChange={(e) => setTherapistEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#0E2453] focus:outline-none focus:ring-2 focus:ring-[#3980BE]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0E2453] uppercase tracking-wider mb-1">
                          ASHA / Clinical License ID
                        </label>
                        <input
                          type="text"
                          required
                          value={therapistLicense}
                          onChange={(e) => setTherapistLicense(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#0E2453] focus:outline-none focus:ring-2 focus:ring-[#3980BE]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#0E2453] uppercase tracking-wider mb-1">
                          Clinical Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={therapistPassword}
                            onChange={(e) => setTherapistPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#0E2453] focus:outline-none focus:ring-2 focus:ring-[#3980BE]"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-xl bg-[#0E2453] hover:bg-[#163678] text-white font-black text-sm shadow-md shadow-[#0E2453]/25 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Sign In to Therapist Portal <ArrowRight className="w-4 h-4 text-[#FFA33E]" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Need help signing in? Contact your clinic administrator.</span>
              <span className="font-semibold text-[#0E2453]">256-bit TLS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20 text-sm font-bold text-[#0E2453]">
          Loading Articulo Authentication Portal...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
