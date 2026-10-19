"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Users,
  PlusCircle,
  Trash2,
  CheckCircle,
  Activity,
  Mic,
  Volume2,
  Clock,
  Flame,
  ChevronRight,
  Send,
  FileText,
  BookOpen,
  Play,
  Square,
  Headphones,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  getStoredPatients,
  setActivePatientId,
  addPrescription,
  removePrescription,
  getAuthSession,
  loginAsTherapist,
} from "@/lib/store";
import { Patient, ExerciseType, AuthSession } from "@/lib/types";
import { SoundwaveIcon } from "@/components/ArticuloLogo";
import { ALPHABET_DATA } from "@/components/AlphabetCoach";

export default function TherapistPortal() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("p1");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Alphabet recording review state
  const [selectedReviewLetter, setSelectedReviewLetter] = useState<string>("A");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Form state for new prescription
  const [newExerciseType, setNewExerciseType] = useState<ExerciseType>("mpt");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newTargetMetric, setNewTargetMetric] = useState<string>("");
  const [newFrequency, setNewFrequency] = useState<string>("Daily");
  const [newTherapistNote, setNewTherapistNote] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const all = getStoredPatients();
      setPatients(all);
      setSession(getAuthSession());
    };
    update();
    window.addEventListener("articulo-storage-update", update);
    return () => window.removeEventListener("articulo-storage-update", update);
  }, []);

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const stopAudioPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingAudioId(null);
  };

  const handlePlayAudioDataUrl = (id: string, audioDataUrl: string) => {
    if (playingAudioId === id) {
      stopAudioPlayback();
      return;
    }
    stopAudioPlayback();
    const audio = new Audio(audioDataUrl);
    audioPlayerRef.current = audio;
    setPlayingAudioId(id);
    audio.onended = () => {
      setPlayingAudioId(null);
      audioPlayerRef.current = null;
    };
    audio.onerror = () => {
      setPlayingAudioId(null);
      audioPlayerRef.current = null;
    };
    audio.play().catch(() => {
      setPlayingAudioId(null);
      audioPlayerRef.current = null;
    });
  };

  const handlePlayReferencePrompt = (letter: string, word: string) => {
    const refId = `ref-${letter}`;
    if (playingAudioId === refId) {
      stopAudioPlayback();
      return;
    }
    stopAudioPlayback();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`Letter ${letter}. ${letter}, as in ${word}.`);
      utterance.rate = 0.88;
      setPlayingAudioId(refId);
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePatientSelect = (id: string) => {
    stopAudioPlayback();
    setSelectedPatientId(id);
    setActivePatientId(id);
  };

  const handleOpenAddModal = (type: ExerciseType = "mpt") => {
    setNewExerciseType(type);
    if (type === "mpt") {
      setNewTitle("Maximum Phonation Time (MPT) Drill");
      setNewTargetMetric("Target: ≥ 16.0s duration on vowel /a/");
      setNewFrequency("2x Daily (Morning & Evening)");
      setNewTherapistNote("Inhale with lower rib expansion; maintain clear phonation without fry.");
    } else if (type === "ddk") {
      setNewTitle("Alternating Motion Rate (SMR / AMR)");
      setNewTargetMetric("Target: ≥ 4.2 reps/sec for PA-TA-KA");
      setNewFrequency("Daily");
      setNewTherapistNote("Emphasize equal syllable duration rather than strained acceleration.");
    } else if (type === "alphabet") {
      setNewTitle("Alphabet Articulation & Phonetic Inventory (A–Z)");
      setNewTargetMetric("Record clear phonetic production across A–Z");
      setNewFrequency("Daily (5–10 letters per session)");
      setNewTherapistNote("Listen to the reference audio prompt first, then articulate the letter and anchor word clearly.");
    } else {
      setNewTitle("Auditory Pitch Discrimination");
      setNewTargetMetric("100% accuracy on 500 Hz reference");
      setNewFrequency("Daily");
      setNewTherapistNote("Calibrate auditory monitoring before beginning vocal exercises.");
    }
    setShowAddModal(true);
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    addPrescription(activePatient.id, {
      exerciseType: newExerciseType,
      title: newTitle,
      targetMetric: newTargetMetric,
      frequency: newFrequency,
      therapistNote: newTherapistNote,
    });

    setShowAddModal(false);
    setNotification(`Successfully assigned "${newTitle}" to ${activePatient.name}`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeletePrescription = (rxId: string, title: string) => {
    if (!activePatient) return;
    removePrescription(activePatient.id, rxId);
    setNotification(`Removed prescription: "${title}"`);
    setTimeout(() => setNotification(null), 3000);
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case "tone":
        return <Volume2 className="w-4 h-4 text-[#3980BE]" />;
      case "ddk":
        return <Activity className="w-4 h-4 text-[#FD903B]" />;
      case "mpt":
        return <Mic className="w-4 h-4 text-[#33B0AA]" />;
      case "alphabet":
        return <BookOpen className="w-4 h-4 text-[#DC8357]" />;
      default:
        return <Activity className="w-4 h-4 text-[#3980BE]" />;
    }
  };

  if (!session || session.role !== "therapist") {
    return (
      <div className="flex-1 bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#3980BE]/15 text-[#3980BE] mx-auto flex items-center justify-center mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3980BE]" /> SLP License Verification
          </div>
          <h2 className="text-2xl font-black text-[#0E2453]">Clinician Login Required</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            Please sign in with your speech-language pathology clinic credentials to manage patient rosters, assign acoustic prescriptions, and listen to patient recordings.
          </p>

          <div className="space-y-3 mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-left">
              Quick 1-Click Clinician Sign-In:
            </span>
            <button
              type="button"
              onClick={() => loginAsTherapist("rachel.vance@clinic.articulo.org", "Dr. Rachel Vance, CCC-SLP")}
              className="w-full p-4 rounded-2xl border border-[#3980BE]/30 bg-[#3980BE]/10 hover:bg-[#3980BE]/20 transition flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E2453] text-[#33B0AA] flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-black text-[#0E2453] text-xs block group-hover:text-[#3980BE]">
                    Dr. Rachel Vance, CCC-SLP
                  </span>
                  <span className="text-[10px] text-slate-600 block">
                    Clinical Director • License #SLP-94820
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#3980BE] group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
            <Link
              href="/login?role=therapist"
              className="text-xs font-bold text-[#3980BE] hover:underline flex items-center gap-1"
            >
              Open Full Clinician Login Form <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Clinician Overview Header with Brand Navy & Soundwave Accent */}
      <div className="bg-gradient-to-r from-[#0E2453] via-[#132d66] to-[#0A1B3F] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        {/* Subtle Decorative Soundwave in Background */}
        <div className="absolute right-6 -bottom-6 opacity-15 pointer-events-none hidden lg:block">
          <SoundwaveIcon className="h-40 w-auto" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#33B0AA]">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">Dr. Rachel Vance, CCC-SLP</h1>
                <span className="text-xs bg-[#33B0AA]/20 text-[#33B0AA] border border-[#33B0AA]/40 font-bold px-2.5 py-0.5 rounded-full">
                  Clinical Director
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5 font-medium">
                Outpatient Neurorehabilitation & Voice Disorders Clinic
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-8 text-xs">
            <div>
              <span className="text-[#33B0AA] uppercase font-extrabold block text-[10px]">
                Active Case Roster
              </span>
              <span className="text-2xl font-black font-mono">{patients.length} Patients</span>
            </div>
            <div>
              <span className="text-[#FD903B] uppercase font-extrabold block text-[10px]">
                Avg Adherence
              </span>
              <span className="text-2xl font-black font-mono text-[#FD903B]">86%</span>
            </div>
            <div>
              <span className="text-[#3980BE] uppercase font-extrabold block text-[10px]">
                Prescriptions
              </span>
              <span className="text-2xl font-black font-mono">
                {patients.reduce((sum, p) => sum + p.prescriptions.length, 0)} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}

      {/* Main Grid: Patient Roster (Left) & Active Patient Management (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient Selector Roster */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#0E2453] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#3980BE]" /> Patient Roster
            </h2>
            <span className="text-xs text-slate-500 font-bold">{patients.length} assigned</span>
          </div>

          <div className="space-y-3">
            {patients.map((p) => {
              const isSelected = p.id === activePatient?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePatientSelect(p.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                    isSelected
                      ? "bg-[#0E2453]/5 border-[#3980BE] ring-2 ring-[#3980BE]/30 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0E2453] text-sm truncate">{p.name}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-medium">
                        Age {p.age}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{p.diagnosis}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px]">
                      <span className="text-[#FD903B] font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" /> {p.streakDays}d streak
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-semibold">
                        {p.prescriptions.length} drills
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? "text-[#3980BE] translate-x-1" : "text-slate-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Patient Case File & Prescription Editor */}
        {activePatient && (
          <div className="lg:col-span-8 space-y-6">
            {/* Patient Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#3980BE] bg-[#3980BE]/10 px-2.5 py-0.5 rounded-full border border-[#3980BE]/20">
                  Active Clinical Case
                </span>
                <h2 className="text-2xl font-black text-[#0E2453] mt-1">{activePatient.name}</h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Diagnosis: <span className="font-bold text-[#0E2453]">{activePatient.diagnosis}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenAddModal("mpt")}
                  className="px-4 py-2.5 bg-[#0E2453] hover:bg-[#163678] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#0E2453]/20 transition"
                >
                  <PlusCircle className="w-4 h-4 text-[#FFA33E]" /> Prescribe Drill
                </button>
              </div>
            </div>

            {/* Prescriptions List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-[#0E2453]">Current Prescriptions</h3>
                  <p className="text-xs text-slate-500">
                    Drills active on {activePatient.name}&apos;s patient portal.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0E2453] bg-slate-100 px-2.5 py-1 rounded-full">
                  {activePatient.prescriptions.length} Prescribed
                </span>
              </div>

              {activePatient.prescriptions.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No exercises prescribed for this patient yet.</p>
                  <button
                    onClick={() => handleOpenAddModal("mpt")}
                    className="mt-3 text-xs text-[#3980BE] font-bold hover:underline"
                  >
                    + Assign First Drill
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activePatient.prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#3980BE]/40 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shrink-0">
                          {getExerciseIcon(rx.exerciseType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0E2453] text-sm">{rx.title}</span>
                            {rx.completedToday && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Completed Today
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {rx.frequency}
                            </span>
                            <span className="font-bold text-[#0E2453] bg-slate-100 px-2 py-0.5 rounded">
                              {rx.targetMetric}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-2 bg-white p-2.5 rounded-lg border border-slate-100">
                            <span className="font-extrabold text-[#3980BE]">Therapist Directive: </span>
                            {rx.therapistNote}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePrescription(rx.id, rx.title)}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition shrink-0 self-end sm:self-start"
                        title="Remove prescription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alphabet A-Z Phonetic Recordings Review Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#DC8357]" />
                    <h3 className="text-base font-black text-[#0E2453]">
                      Alphabet Phonetic Recordings (A–Z Review)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any letter to inspect and listen to {activePatient.name}&apos;s recorded voice production.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
                  {Object.keys(activePatient.alphabetRecordings || {}).length} / 26 Letters Recorded
                </span>
              </div>

              {/* 26-Letter Grid */}
              <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-1.5 mb-5">
                {ALPHABET_DATA.map((item) => {
                  const hasRec = Boolean(activePatient.alphabetRecordings?.[item.letter]);
                  const isCurrent = item.letter === selectedReviewLetter;
                  return (
                    <button
                      key={item.letter}
                      type="button"
                      onClick={() => {
                        stopAudioPlayback();
                        setSelectedReviewLetter(item.letter);
                      }}
                      className={`relative h-10 rounded-lg font-black text-xs transition-all flex flex-col items-center justify-center border ${
                        isCurrent
                          ? "bg-[#0E2453] text-white border-[#0E2453] shadow-md scale-105 z-10"
                          : hasRec
                          ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                      title={
                        hasRec
                          ? `Letter ${item.letter} (${item.word}) - Recorded`
                          : `Letter ${item.letter} (${item.word}) - Not recorded yet`
                      }
                    >
                      <span>{item.letter}</span>
                      {hasRec && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                            isCurrent ? "bg-[#FFA33E]" : "bg-emerald-500"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Letter Recording Inspector */}
              {(() => {
                const letterMeta =
                  ALPHABET_DATA.find((d) => d.letter === selectedReviewLetter) || ALPHABET_DATA[0];
                const rec = activePatient.alphabetRecordings?.[selectedReviewLetter];
                const patientPlayId = `patient-rec-${selectedReviewLetter}`;
                const refPlayId = `ref-${selectedReviewLetter}`;
                const isPlayingPatient = playingAudioId === patientPlayId;
                const isPlayingRef = playingAudioId === refPlayId;

                return (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-2xl shrink-0 border ${
                          rec
                            ? "bg-[#0E2453] text-white border-[#0E2453]"
                            : "bg-white text-slate-400 border-slate-200"
                        }`}
                      >
                        {letterMeta.letter}
                        <span className="text-[9px] font-mono font-normal opacity-80">
                          {letterMeta.phonetic}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-[#0E2453] text-sm">
                            Letter &ldquo;{letterMeta.letter}&rdquo; — {letterMeta.word}
                          </span>
                          {rec ? (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Audio Available ({rec.durationSec}s)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                              Awaiting Patient Recording
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{letterMeta.cue}</p>
                        {rec && (
                          <p className="text-[11px] text-slate-400 font-mono mt-1">
                            Recorded: {rec.recordedAt}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePlayReferencePrompt(letterMeta.letter, letterMeta.word)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                          isPlayingRef
                            ? "bg-[#3980BE] text-white border-[#3980BE]"
                            : "bg-white hover:bg-slate-100 text-[#0E2453] border-slate-200"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#3980BE]" />
                        {isPlayingRef ? "Stop Prompt" : "Reference Prompt"}
                      </button>

                      {rec ? (
                        <button
                          type="button"
                          onClick={() => handlePlayAudioDataUrl(patientPlayId, rec.audioDataUrl)}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm ${
                            isPlayingPatient
                              ? "bg-rose-600 hover:bg-rose-500 text-white"
                              : "bg-[#33B0AA] hover:bg-[#2b9994] text-white"
                          }`}
                        >
                          {isPlayingPatient ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current" /> Stop Patient Audio
                            </>
                          ) : (
                            <>
                              <Headphones className="w-3.5 h-3.5" /> Play Patient Recording
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic px-2">
                          No clip uploaded yet
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Objective Telemetry / Recorded History */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-[#0E2453]">Recorded Patient Telemetry</h3>
                  <p className="text-xs text-slate-500">
                    Acoustic results uploaded from home sessions.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">Live Sync</span>
              </div>

              {activePatient.history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No session data recorded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {activePatient.history.map((hist) => {
                    const isPlayingHist = playingAudioId === hist.id;
                    return (
                      <div
                        key={hist.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                            {getExerciseIcon(hist.exerciseType)}
                          </div>
                          <div>
                            <span className="font-bold text-[#0E2453]">{hist.exerciseTitle}</span>
                            <span className="text-[11px] text-slate-400 block">{hist.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {hist.audioDataUrl && (
                            <button
                              type="button"
                              onClick={() => handlePlayAudioDataUrl(hist.id, hist.audioDataUrl!)}
                              className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition ${
                                isPlayingHist
                                  ? "bg-rose-600 text-white"
                                  : "bg-[#0E2453] hover:bg-[#163678] text-white"
                              }`}
                            >
                              {isPlayingHist ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" /> Stop
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 fill-current text-[#FFA33E]" /> Play Voice
                                </>
                              )}
                            </button>
                          )}
                          <span className="font-mono font-bold text-[#0E2453] bg-[#33B0AA]/15 border border-[#33B0AA]/30 px-2.5 py-1 rounded-md">
                            {hist.result}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Prescribe Exercise */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-black text-[#0E2453]">Prescribe Speech Drill</h3>
                <p className="text-xs text-slate-500">
                  Assigning to <span className="font-bold text-[#0E2453]">{activePatient?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
              {/* Exercise Type */}
              <div>
                <label className="block font-bold text-[#0E2453] uppercase tracking-wider text-[10px] mb-1.5">
                  Select Exercise Core
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal("mpt")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 ${
                      newExerciseType === "mpt"
                        ? "border-[#33B0AA] bg-[#33B0AA]/10 text-[#0E2453] ring-2 ring-[#33B0AA]/40"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Mic className="w-4 h-4 text-[#33B0AA]" />
                    <span>MPT Phonation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAddModal("ddk")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 ${
                      newExerciseType === "ddk"
                        ? "border-[#FD903B] bg-[#FD903B]/10 text-[#0E2453] ring-2 ring-[#FD903B]/40"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Activity className="w-4 h-4 text-[#FD903B]" />
                    <span>DDK Pacing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAddModal("alphabet")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 ${
                      newExerciseType === "alphabet"
                        ? "border-[#DC8357] bg-[#DC8357]/10 text-[#0E2453] ring-2 ring-[#DC8357]/40"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-[#DC8357]" />
                    <span>Alphabet A–Z</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAddModal("tone")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 ${
                      newExerciseType === "tone"
                        ? "border-[#3980BE] bg-[#3980BE]/10 text-[#0E2453] ring-2 ring-[#3980BE]/40"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-[#3980BE]" />
                    <span>Pitch Match</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-[#0E2453] uppercase tracking-wider text-[10px] mb-1">
                  Prescription Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3980BE]"
                />
              </div>

              {/* Target Metric */}
              <div>
                <label className="block font-bold text-[#0E2453] uppercase tracking-wider text-[10px] mb-1">
                  Clinical Target Goal
                </label>
                <input
                  type="text"
                  required
                  value={newTargetMetric}
                  onChange={(e) => setNewTargetMetric(e.target.value)}
                  placeholder="e.g. Target: ≥ 15.0 seconds duration"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3980BE]"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block font-bold text-[#0E2453] uppercase tracking-wider text-[10px] mb-1">
                  Prescribed Frequency
                </label>
                <input
                  type="text"
                  required
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  placeholder="e.g. 2x Daily (Morning & Evening)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3980BE]"
                />
              </div>

              {/* Therapist Directive Note */}
              <div>
                <label className="block font-bold text-[#0E2453] uppercase tracking-wider text-[10px] mb-1">
                  Clinical Guidance & Patient Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTherapistNote}
                  onChange={(e) => setNewTherapistNote(e.target.value)}
                  placeholder="Specific cues for the patient (e.g. 'Focus on diaphragmatic expansion; avoid vocal fry.')"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#3980BE]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0E2453] hover:bg-[#163678] text-white font-extrabold rounded-xl flex items-center gap-1.5 shadow-md shadow-[#0E2453]/20 transition"
                >
                  <Send className="w-3.5 h-3.5 text-[#FFA33E]" /> Prescribe to Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
