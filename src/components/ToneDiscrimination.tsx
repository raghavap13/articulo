"use client";

import React, { useState, useRef } from "react";
import { Volume2, CheckCircle, RotateCcw, Award } from "lucide-react";

interface ToneDiscriminationProps {
  onComplete?: (result: string) => void;
  targetMetric?: string;
  therapistNote?: string;
}

export default function ToneDiscrimination({
  onComplete,
  targetMetric,
  therapistNote,
}: ToneDiscriminationProps) {
  const [toneFeedback, setToneFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playPureTone = (frequency: number) => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  };

  const handleSelect = (tone: "A" | "B") => {
    if (tone === "A") {
      playPureTone(500);
      setToneFeedback("Correct! Tone A is 500 Hz, matching standard conversational speech baseline.");
      setIsCorrect(true);
      if (onComplete) {
        onComplete("500 Hz matched correctly (100% accuracy)");
      }
    } else {
      playPureTone(1000);
      setToneFeedback("Incorrect. Tone B is 1000 Hz (a higher octave). Try listening to Tone A.");
      setIsCorrect(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-[#0E2453]">Auditory Pitch Match</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Identify which frequency matches the standard speech baseline (500 Hz).
          </p>
        </div>
        <span className="text-xs bg-[#3980BE]/15 text-[#0E2453] font-extrabold px-3 py-1 rounded-full border border-[#3980BE]/25">
          Auditory
        </span>
      </div>

      {therapistNote && (
        <div className="mb-6 p-3.5 bg-[#3980BE]/10 border border-[#3980BE]/25 rounded-2xl text-xs text-[#0E2453]">
          <span className="font-extrabold text-[#3980BE]">Therapist Directive: </span>
          {therapistNote}
        </div>
      )}

      {targetMetric && (
        <div className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Target Goal: <span className="text-[#0E2453] font-black">{targetMetric}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleSelect("A")}
          className="flex flex-col items-center justify-center p-6 bg-[#33B0AA]/10 border border-[#33B0AA]/30 rounded-2xl hover:bg-[#33B0AA]/20 transition active:scale-95 group shadow-2xs"
        >
          <Volume2 className="w-8 h-8 text-[#33B0AA] mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-black text-[#0E2453]">Tone A</span>
          <span className="text-xs text-[#33B0AA] font-bold mt-1">500 Hz Candidate</span>
        </button>

        <button
          onClick={() => handleSelect("B")}
          className="flex flex-col items-center justify-center p-6 bg-[#3980BE]/10 border border-[#3980BE]/30 rounded-2xl hover:bg-[#3980BE]/20 transition active:scale-95 group shadow-2xs"
        >
          <Volume2 className="w-8 h-8 text-[#3980BE] mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-black text-[#0E2453]">Tone B</span>
          <span className="text-xs text-[#3980BE] font-bold mt-1">1000 Hz Candidate</span>
        </button>
      </div>

      {toneFeedback && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium border flex items-start gap-3 ${
            isCorrect
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-amber-50 text-amber-900 border-amber-200"
          }`}
        >
          {isCorrect ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-bold">{toneFeedback}</p>
            {isCorrect && (
              <div className="mt-2 text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Prescribed Goal Met!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
