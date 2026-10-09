"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, Play, CheckCircle, RotateCcw } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"hearing" | "ddk">("hearing");

  // Auditory Discrimination State
  const [toneFeedback, setToneFeedback] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // DDK Rate Coach State
  const [ddkCount, setDdkCount] = useState<number>(0);
  const [ddkActive, setDdkActive] = useState<boolean>(false);
  const [ddkTimer, setDdkTimer] = useState<number>(5);

  const playPureTone = (frequency: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Smooth gain curve to prevent clicks
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  };

  // DDK Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (ddkActive && ddkTimer > 0) {
      interval = setInterval(() => {
        setDdkTimer((prev) => prev - 1);
      }, 1000);
    } else if (ddkTimer === 0 && ddkActive) {
      setDdkActive(false);
    }
    return () => clearInterval(interval);
  }, [ddkActive, ddkTimer]);

  const startDDK = () => {
    setDdkCount(0);
    setDdkTimer(5);
    setDdkActive(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans">
      <header className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-sky-700 tracking-tight">Articulo</h1>
        <p className="text-slate-600 mt-2 text-lg">Home Speech & Auditory Rehabilitation</p>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-xl mx-auto flex rounded-xl bg-slate-200 p-1 mb-8">
        <button
          onClick={() => setActiveTab("hearing")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === "hearing" ? "bg-white text-sky-700 shadow" : "text-slate-600"
          }`}
        >
          1. Tone Discrimination
        </button>
        <button
          onClick={() => setActiveTab("ddk")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === "ddk" ? "bg-white text-sky-700 shadow" : "text-slate-600"
          }`}
        >
          2. DDK Motor Pacing
        </button>
      </div>

      {/* Module 1: Tone Discrimination */}
      {activeTab === "hearing" && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Auditory Pitch Match</h2>
          <p className="text-sm text-slate-600 mb-6">
            Listen to both tones below. Identify which frequency matches the standard speech baseline (500 Hz).
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => {
                playPureTone(500);
                setToneFeedback("Correct! 500 Hz is in the primary speech frequency range.");
              }}
              className="flex flex-col items-center justify-center p-6 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-100 transition active:scale-95"
            >
              <Volume2 className="w-8 h-8 text-sky-600 mb-2" />
              <span className="font-semibold text-sky-900">Tone A</span>
            </button>

            <button
              onClick={() => {
                playPureTone(1000);
                setToneFeedback("Incorrect. That is a 1000 Hz tone (higher octave).");
              }}
              className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition active:scale-95"
            >
              <Volume2 className="w-8 h-8 text-slate-600 mb-2" />
              <span className="font-semibold text-slate-800">Tone B</span>
            </button>
          </div>

          {toneFeedback && (
            <div className="p-4 rounded-xl bg-slate-100 text-sm font-medium text-slate-800 border border-slate-200">
              {toneFeedback}
            </div>
          )}
        </div>
      )}

      {/* Module 2: Diadochokinetic Rate Coach */}
      {activeTab === "ddk" && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">DDK Speed & Articulation</h2>
          <p className="text-sm text-slate-600 mb-6">
            Say <strong>"PA-TA-KA"</strong> rapidly. Tap the button on each cycle during the 5-second window.
          </p>

          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="text-center">
              <span className="block text-3xl font-extrabold text-sky-700">{ddkTimer}s</span>
              <span className="text-xs uppercase font-semibold text-slate-400">Time Left</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-extrabold text-sky-700">{ddkCount}</span>
              <span className="text-xs uppercase font-semibold text-slate-400">Repetitions</span>
            </div>
          </div>

          {!ddkActive && ddkTimer === 5 && (
            <button
              onClick={startDDK}
              className="w-full py-4 bg-sky-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-sky-700 transition"
            >
              <Play className="w-5 h-5 fill-current" /> Start Exercise
            </button>
          )}

          {ddkActive && (
            <button
              onClick={() => setDdkCount((c) => c + 1)}
              className="w-full py-8 bg-amber-500 text-white text-2xl font-black rounded-xl hover:bg-amber-600 active:scale-95 transition shadow-lg"
            >
              TAP ("PA-TA-KA")
            </button>
          )}

          {!ddkActive && ddkTimer === 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
                <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                <p className="font-semibold">Complete! Rate: {(ddkCount / 5).toFixed(1)} reps/sec</p>
              </div>
              <button
                onClick={startDDK}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}