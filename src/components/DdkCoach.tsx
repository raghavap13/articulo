"use client";

import React, { useState, useEffect } from "react";
import { Play, CheckCircle, RotateCcw, Award } from "lucide-react";

interface DdkCoachProps {
  onComplete?: (result: string) => void;
  targetMetric?: string;
  therapistNote?: string;
}

export default function DdkCoach({ onComplete, targetMetric, therapistNote }: DdkCoachProps) {
  const [ddkCount, setDdkCount] = useState<number>(0);
  const [ddkActive, setDdkActive] = useState<boolean>(false);
  const [ddkTimer, setDdkTimer] = useState<number>(5);
  const [hasFinished, setHasFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!ddkActive) return;

    const interval = setInterval(() => {
      setDdkTimer((prev) => {
        if (prev <= 1) {
          setDdkActive(false);
          setHasFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ddkActive]);

  useEffect(() => {
    if (hasFinished && ddkTimer === 0 && ddkCount > 0) {
      const rate = (ddkCount / 5).toFixed(1);
      if (onComplete) {
        onComplete(`${rate} reps/sec (${ddkCount} repetitions in 5s)`);
      }
    }
  }, [hasFinished, ddkTimer, ddkCount, onComplete]);

  const startDDK = () => {
    setDdkCount(0);
    setDdkTimer(5);
    setHasFinished(false);
    setDdkActive(true);
  };

  const calculatedRate = (ddkCount / 5).toFixed(1);

  return (
    <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
      <div className="flex items-center justify-between mb-4 text-left">
        <div>
          <h2 className="text-xl font-black text-[#0E2453]">DDK Speed & Articulation</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Diadochokinetic rate assessment for motor speech coordination.
          </p>
        </div>
        <span className="text-xs bg-[#FD903B]/15 text-[#0E2453] font-extrabold px-3 py-1 rounded-full border border-[#FD903B]/30 shrink-0">
          Motor Speech
        </span>
      </div>

      {therapistNote && (
        <div className="mb-6 p-3.5 bg-[#3980BE]/10 border border-[#3980BE]/25 rounded-2xl text-xs text-[#0E2453] text-left">
          <span className="font-extrabold text-[#3980BE]">Therapist Directive: </span>
          {therapistNote}
        </div>
      )}

      {targetMetric && (
        <div className="mb-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
          Target Goal: <span className="text-[#0E2453] font-black">{targetMetric}</span>
        </div>
      )}

      <p className="text-xs sm:text-sm text-slate-600 mb-6 font-medium">
        Say <strong className="text-[#0E2453] font-black">&quot;PA-TA-KA&quot;</strong> rapidly. Tap the button on each cycle during the 5-second window.
      </p>

      <div className="flex justify-center items-center gap-8 mb-8">
        <div className="text-center">
          <span className="block text-4xl sm:text-5xl font-black text-[#0E2453] font-mono">{ddkTimer}s</span>
          <span className="text-xs uppercase font-extrabold text-[#3980BE]">Time Left</span>
        </div>
        <div className="text-center">
          <span className="block text-4xl sm:text-5xl font-black text-[#FD903B] font-mono">{ddkCount}</span>
          <span className="text-xs uppercase font-extrabold text-[#FD903B]">Repetitions</span>
        </div>
      </div>

      {!ddkActive && ddkTimer === 5 && (
        <button
          onClick={startDDK}
          className="w-full py-4 bg-[#0E2453] hover:bg-[#163678] text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 transition shadow-lg shadow-[#0E2453]/25"
        >
          <Play className="w-5 h-5 fill-current text-[#FFA33E]" /> Start 5s Exercise
        </button>
      )}

      {ddkActive && (
        <button
          onClick={() => setDdkCount((c) => c + 1)}
          className="w-full py-8 bg-[#FD903B] hover:bg-[#e07b28] text-white text-2xl font-black rounded-2xl active:scale-95 transition shadow-xl shadow-[#FD903B]/30 select-none cursor-pointer"
        >
          TAP (&quot;PA-TA-KA&quot;)
        </button>
      )}

      {!ddkActive && ddkTimer === 0 && (
        <div className="space-y-4">
          <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl">
            <CheckCircle className="w-6 h-6 mx-auto mb-1.5 text-emerald-600" />
            <p className="text-lg font-black text-[#0E2453]">Complete! Rate: {calculatedRate} reps/sec</p>
            <p className="text-xs text-emerald-800 font-semibold mt-1">
              {Number(calculatedRate) >= 4.0
                ? "Excellent motor sequencing speed! Standard adult norm achieved."
                : "Good effort! Practice smooth syllable transitions without rushing."}
            </p>
            {onComplete && (
              <div className="mt-2 text-xs font-black text-emerald-800 inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Prescribed Session Recorded!
              </div>
            )}
          </div>
          <button
            onClick={startDDK}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0E2453] hover:bg-[#163678] text-white rounded-xl text-xs font-extrabold transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-[#FFA33E]" /> Try Again
          </button>
        </div>
      )}
    </div>
  );
}
