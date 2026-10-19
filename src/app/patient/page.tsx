"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Flame,
  Stethoscope,
  Play,
  RotateCcw,
  X,
  Activity,
  Mic,
  Volume2,
  BookOpen,
  Lock,
  ArrowRight,
} from "lucide-react";
import { getActivePatient, completePrescription, getAuthSession, loginAsPatient, getStoredPatients } from "@/lib/store";
import { Patient, Prescription, AuthSession } from "@/lib/types";
import ToneDiscrimination from "@/components/ToneDiscrimination";
import DdkCoach from "@/components/DdkCoach";
import MptCoach from "@/components/MptCoach";
import AlphabetCoach from "@/components/AlphabetCoach";
import { SoundwaveIcon } from "@/components/ArticuloLogo";

export default function PatientPortal() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [showCompletionBanner, setShowCompletionBanner] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      setPatient(getActivePatient());
      setSession(getAuthSession());
      setAllPatients(getStoredPatients());
    };
    load();
    window.addEventListener("articulo-storage-update", load);
    return () => window.removeEventListener("articulo-storage-update", load);
  }, []);

  // If not logged in as a patient, show authentication gate
  if (!session || session.role !== "patient") {
    return (
      <div className="flex-1 bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#33B0AA]/10 text-[#33B0AA] mx-auto flex items-center justify-center mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-[#0E2453]">Patient Sign-In Required</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            Please sign in to view your prescribed therapy queue, track your streak, and access interactive biofeedback drills.
          </p>

          <div className="space-y-3 mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-left">
              Quick 1-Click Patient Sign-In:
            </span>
            {allPatients.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => loginAsPatient(p.id)}
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-[#33B0AA]/10 hover:border-[#33B0AA]/40 transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-bold text-[#0E2453] text-xs block group-hover:text-[#33B0AA]">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                      {p.diagnosis.split("&")[0]}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#33B0AA] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
            <Link
              href="/login?role=patient"
              className="text-xs font-bold text-[#3980BE] hover:underline flex items-center gap-1"
            >
              Open Full Patient Login Form <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3980BE]" />
      </div>
    );
  }

  const completedCount = patient.prescriptions.filter((rx) => rx.completedToday).length;
  const totalCount = patient.prescriptions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleExerciseCompleted = (resultSummary: string, audioDataUrl?: string) => {
    if (!activePrescription) return;
    completePrescription(patient.id, activePrescription.id, resultSummary, audioDataUrl);
    setShowCompletionBanner(`Completed "${activePrescription.title}"! Result: ${resultSummary}`);
    setTimeout(() => {
      setActivePrescription(null);
    }, 2500);
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case "alphabet":
        return <BookOpen className="w-5 h-5 text-[#DC8357]" />;
      case "tone":
        return <Volume2 className="w-5 h-5 text-[#3980BE]" />;
      case "ddk":
        return <Activity className="w-5 h-5 text-[#FD903B]" />;
      case "mpt":
        return <Mic className="w-5 h-5 text-[#33B0AA]" />;
      default:
        return <Activity className="w-5 h-5 text-[#3980BE]" />;
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Patient Header & Clinical Supervision Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={patient.avatar}
              alt={patient.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#33B0AA]/30 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#0E2453] tracking-tight">{patient.name}</h1>
                <span className="text-xs bg-[#0E2453]/5 text-[#0E2453] font-bold px-2.5 py-0.5 rounded-full">
                  Age {patient.age}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-semibold">{patient.diagnosis}</p>
            </div>
          </div>

          {/* Clinician Connection & Streak Stats */}
          <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center gap-3 bg-[#33B0AA]/10 border border-[#33B0AA]/30 px-4 py-2.5 rounded-2xl">
              <Stethoscope className="w-5 h-5 text-[#33B0AA] shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-extrabold text-[#33B0AA]">
                  Supervising Clinician
                </span>
                <span className="text-xs font-bold text-[#0E2453]">{patient.therapistName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-[#FFA33E]/10 border border-[#FFA33E]/30 px-4 py-2.5 rounded-2xl">
              <Flame className="w-5 h-5 text-[#FD903B] fill-[#FD903B] shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-extrabold text-[#DC8357]">
                  Adherence Streak
                </span>
                <span className="text-xs font-black text-[#0E2453]">{patient.streakDays} Days Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Prescribed Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-[#0E2453] uppercase tracking-wider">
              Today&apos;s Prescription Plan
            </span>
            <span className="text-[#3980BE] font-mono font-bold">
              {completedCount} of {totalCount} Completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#33B0AA] via-[#3980BE] to-[#DC8357] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Completion Alert Toast */}
      {showCompletionBanner && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <span className="font-bold text-sm">{showCompletionBanner}</span>
          </div>
          <button
            onClick={() => setShowCompletionBanner(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Active Exercise Interactive Modal / Runner */}
      {activePrescription && (
        <div className="mb-10 bg-slate-100 p-6 sm:p-8 rounded-3xl border-2 border-[#3980BE] shadow-xl relative">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white shadow-xs">
                {getExerciseIcon(activePrescription.exerciseType)}
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase text-[#3980BE] tracking-wider">
                  Active Prescribed Session
                </span>
                <h2 className="text-xl font-bold text-[#0E2453]">{activePrescription.title}</h2>
              </div>
            </div>
            <button
              onClick={() => setActivePrescription(null)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0E2453] text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
            >
              <X className="w-4 h-4" /> Exit Session
            </button>
          </div>

          {/* Exercise Render */}
          <div>
            {activePrescription.exerciseType === "alphabet" && (
              <AlphabetCoach
                onComplete={handleExerciseCompleted}
                targetMetric={activePrescription.targetMetric}
                therapistNote={activePrescription.therapistNote}
              />
            )}
            {activePrescription.exerciseType === "tone" && (
              <ToneDiscrimination
                onComplete={handleExerciseCompleted}
                targetMetric={activePrescription.targetMetric}
                therapistNote={activePrescription.therapistNote}
              />
            )}
            {activePrescription.exerciseType === "ddk" && (
              <DdkCoach
                onComplete={handleExerciseCompleted}
                targetMetric={activePrescription.targetMetric}
                therapistNote={activePrescription.therapistNote}
              />
            )}
            {activePrescription.exerciseType === "mpt" && (
              <MptCoach
                onComplete={handleExerciseCompleted}
                targetMetric={activePrescription.targetMetric}
                therapistNote={activePrescription.therapistNote}
              />
            )}
          </div>
        </div>
      )}

      {/* Main Content: Prescribed Tasks & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Prescribed Exercises */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#0E2453]">Assigned Exercises</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted drills ordered by {patient.therapistName}.
              </p>
            </div>
            <span className="text-xs font-bold text-[#0E2453] bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              {totalCount} Active Prescriptions
            </span>
          </div>

          <div className="space-y-4">
            {patient.prescriptions.map((rx) => {
              const isSelected = activePrescription?.id === rx.id;
              return (
                <div
                  key={rx.id}
                  className={`bg-white rounded-2xl p-6 border transition-all ${
                    rx.completedToday
                      ? "border-emerald-200 bg-emerald-50/20 shadow-xs"
                      : "border-slate-200 hover:border-[#3980BE]/60 hover:shadow-md"
                  } ${isSelected ? "ring-2 ring-[#3980BE]" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                        {getExerciseIcon(rx.exerciseType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-[#0E2453]">{rx.title}</h3>
                          {rx.completedToday && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              <CheckCircle className="w-3.5 h-3.5" /> Done Today
                            </span>
                          )}
                        </div>

                        {/* Frequency & Target Goal */}
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                          <span className="text-slate-500 flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {rx.frequency}
                          </span>
                          <span className="font-bold text-[#0E2453] bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {rx.targetMetric}
                          </span>
                        </div>

                        {/* Therapist Directive */}
                        <div className="mt-3 p-3.5 bg-[#3980BE]/10 rounded-xl border border-[#3980BE]/25 text-xs text-[#0E2453] leading-relaxed">
                          <span className="font-extrabold text-[#3980BE]">Clinician Note: </span>
                          {rx.therapistNote}
                        </div>
                      </div>
                    </div>

                    {/* Launch Drill Button */}
                    <div className="sm:self-center shrink-0">
                      <button
                        onClick={() => setActivePrescription(rx)}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition ${
                          rx.completedToday
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-[#0E2453] hover:bg-[#163678] text-white shadow-md shadow-[#0E2453]/20"
                        }`}
                      >
                        {rx.completedToday ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" /> Practice Again
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current text-[#FFA33E]" /> Start Exercise
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Adherence History & Telemetry */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#0E2453]">Recent Telemetry</h2>
            <p className="text-xs text-slate-500 mt-0.5">Objective results shared with your therapist.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            {patient.history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No exercise history recorded yet.</p>
            ) : (
              patient.history.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-2xs">
                      {getExerciseIcon(item.exerciseType)}
                    </div>
                    <div>
                      <span className="font-bold text-[#0E2453] block">{item.exerciseTitle}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#0E2453] bg-[#33B0AA]/15 px-2.5 py-1 rounded-md border border-[#33B0AA]/30">
                    {item.result}
                  </span>
                </div>
              ))
            )}

            <div className="pt-2 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
              <SoundwaveIcon className="h-3 w-auto opacity-60" />
              <span>Acoustic telemetry synced via Articulo Cloud</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
