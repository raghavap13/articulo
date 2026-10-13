"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Play, Square, RotateCcw, CheckCircle, Award, Info } from "lucide-react";

type VowelType = "ah" | "ee" | "oo";

const VOWEL_LABELS: Record<VowelType, { label: string; phonetic: string; tip: string }> = {
  ah: { label: "/a/", phonetic: '"AHHH"', tip: "Relax your jaw and keep tongue flat." },
  ee: { label: "/i/", phonetic: '"EEE"', tip: "Spread lips slightly, high front tongue." },
  oo: { label: "/u/", phonetic: '"OOOH"', tip: "Round lips forward with steady airflow." },
};

interface MptCoachProps {
  onComplete?: (result: string) => void;
  targetMetric?: string;
  therapistNote?: string;
}

export default function MptCoach({ onComplete, targetMetric, therapistNote }: MptCoachProps) {
  const [selectedVowel, setSelectedVowel] = useState<VowelType>("ah");
  const [useMicrophone, setUseMicrophone] = useState<boolean>(true);
  const [micStatus, setMicStatus] = useState<"idle" | "listening" | "denied">("idle");

  // Timer & Phonation tracking
  const [isPhonating, setIsPhonating] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in seconds with decimals
  const [currentVolume, setCurrentVolume] = useState<number>(0); // 0-100%
  const [threshold] = useState<number>(18); // Volume threshold % to count as vocalization
  const [trials, setTrials] = useState<number[]>([]);

  // Web Audio & Synchronization Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isPhonatingRef = useRef<boolean>(false);
  const useMicrophoneRef = useRef<boolean>(true);
  const thresholdRef = useRef<number>(18);

  useEffect(() => {
    useMicrophoneRef.current = useMicrophone;
  }, [useMicrophone]);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  // Stop active trial and save record
  const finishTrial = useCallback(
    (duration: number) => {
      isPhonatingRef.current = false;
      setIsPhonating(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (duration >= 0.8) {
        const recorded = parseFloat(duration.toFixed(1));
        setTrials((prev) => [...prev, recorded]);
        if (onComplete) {
          onComplete(`${recorded}s sustained phonation`);
        }
      }
    },
    [onComplete]
  );

  // Clean up audio hardware
  const stopAudioMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicStatus("idle");
    setCurrentVolume(0);
  }, []);

  // Setup Web Audio Mic Listener with RMS volume calculation
  const startAudioMonitoring = useCallback(async () => {
    try {
      stopAudioMonitoring();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      mediaStreamRef.current = stream;
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtx) {
        setUseMicrophone(false);
        return;
      }

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);
      analyserRef.current = analyser;

      setMicStatus("listening");

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(buffer);

        // Compute RMS volume
        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i++) {
          const norm = (buffer[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / buffer.length);
        const volumePercent = Math.min(100, Math.round(rms * 250));
        setCurrentVolume(volumePercent);

        if (useMicrophoneRef.current) {
          if (volumePercent >= thresholdRef.current) {
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }

            if (!isPhonatingRef.current) {
              isPhonatingRef.current = true;
              setIsPhonating(true);
              startTimeRef.current = performance.now();
              setElapsedTime(0);

              if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = setInterval(() => {
                const elapsed = (performance.now() - startTimeRef.current) / 1000;
                setElapsedTime(elapsed);
              }, 50);
            }
          } else if (isPhonatingRef.current && !silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              const finalDuration = (performance.now() - startTimeRef.current - 650) / 1000;
              finishTrial(Math.max(0, finalDuration));
            }, 650);
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      animationFrameRef.current = requestAnimationFrame(checkVolume);
    } catch {
      setMicStatus("denied");
      setUseMicrophone(false);
    }
  }, [stopAudioMonitoring, finishTrial]);

  // Manual timer toggle (for non-mic mode)
  const toggleManualPhonation = () => {
    if (!isPhonating) {
      setIsPhonating(true);
      setElapsedTime(0);
      startTimeRef.current = performance.now();

      timerIntervalRef.current = setInterval(() => {
        const elapsed = (performance.now() - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);
      }, 50);
    } else {
      const finalDuration = (performance.now() - startTimeRef.current) / 1000;
      finishTrial(finalDuration);
    }
  };

  // Reset all trials
  const resetTrials = () => {
    finishTrial(0);
    setElapsedTime(0);
    setTrials([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioMonitoring();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [stopAudioMonitoring]);

  const bestDuration = trials.length > 0 ? Math.max(...trials) : 0;
  const avgDuration =
    trials.length > 0 ? (trials.reduce((a, b) => a + b, 0) / trials.length).toFixed(1) : "0.0";

  // Clinical Norm Reference
  const getNormFeedback = (seconds: number) => {
    if (seconds === 0) return null;
    if (seconds < 10) {
      return {
        level: "Below Baseline (<10s)",
        color: "text-amber-700 bg-amber-50 border-amber-200",
        message: "Indicates reduced glottal efficiency or breath support. Practice deep diaphragmatic inhalations.",
      };
    }
    if (seconds < 15) {
      return {
        level: "Functional Range (10-15s)",
        color: "text-sky-700 bg-sky-50 border-sky-200",
        message: "Solid foundation for conversational speech. Work on steady airflow to extend duration.",
      };
    }
    if (seconds < 22) {
      return {
        level: "Target Adult Range (15-22s)",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        message: "Meets standard adult female norms (15-20s) and healthy vocal fold closure.",
      };
    }
    return {
      level: "Optimal Phonation (22s+)",
      color: "text-purple-700 bg-purple-50 border-purple-200",
      message: "Exceeds standard adult male norms (20-25s) with excellent respiratory-phonatory coordination.",
    };
  };

  const normFeedback = getNormFeedback(bestDuration);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#0E2453]">Maximum Phonation Time (MPT)</h2>
              <span className="text-xs bg-[#33B0AA]/15 text-[#0E2453] font-extrabold px-3 py-1 rounded-full border border-[#33B0AA]/30">
                Voice & Breath
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Take a deep breath and sustain your vowel on a single breath for as long as possible.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start">
            <button
              onClick={() => {
                setUseMicrophone(true);
                if (micStatus === "idle") startAudioMonitoring();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                useMicrophone ? "bg-[#0E2453] text-white shadow-xs" : "text-slate-600 hover:text-[#0E2453]"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-[#33B0AA]" /> Auto Mic
            </button>
            <button
              onClick={() => {
                setUseMicrophone(false);
                stopAudioMonitoring();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                !useMicrophone ? "bg-[#0E2453] text-white shadow-xs" : "text-slate-600 hover:text-[#0E2453]"
              }`}
            >
              <Play className="w-3.5 h-3.5 text-[#FFA33E]" /> Manual
            </button>
          </div>
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

        {/* Vowel Target Selection */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select Sustained Vowel
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(VOWEL_LABELS) as VowelType[]).map((vowel) => {
              const info = VOWEL_LABELS[vowel];
              const isSelected = selectedVowel === vowel;
              return (
                <button
                  key={vowel}
                  onClick={() => setSelectedVowel(vowel)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    isSelected
                      ? "border-[#33B0AA] bg-[#33B0AA]/10 ring-2 ring-[#33B0AA]/30"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50"
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-[#0E2453]">{info.label}</span>
                    <span className="text-xs font-bold text-[#33B0AA]">{info.phonetic}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{info.tip}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Phonation Dashboard */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xs">
          {/* Background Ambient Glow */}
          <div
            className={`absolute inset-0 bg-[#33B0AA]/10 transition-opacity duration-300 pointer-events-none ${
              isPhonating ? "opacity-100" : "opacity-0"
            }`}
          />

          <div className="relative z-10">
            <span className="inline-block text-xs uppercase font-extrabold text-[#3980BE] tracking-wider mb-1">
              {isPhonating ? "Vocalizing..." : "Sustained Time"}
            </span>

            {/* Live Timer Counter */}
            <div className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-[#0E2453] my-2">
              {elapsedTime.toFixed(1)}
              <span className="text-2xl sm:text-3xl font-sans font-medium text-slate-400 ml-1">s</span>
            </div>

            {/* Target Norm Markers */}
            <div className="max-w-xs mx-auto mb-6">
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mb-1">
                <span>0s</span>
                <span>Baseline (10s)</span>
                <span>Norm (20s)</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex border border-slate-300/50">
                <div
                  className="bg-[#FD903B] h-full transition-all duration-75"
                  style={{ width: `${Math.min(50, (elapsedTime / 20) * 100)}%` }}
                />
                <div
                  className="bg-[#33B0AA] h-full transition-all duration-75"
                  style={{
                    width: `${Math.max(0, Math.min(50, ((elapsedTime - 10) / 20) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Live Audio Visualizer / Volume Bar (Auto Mic Mode) */}
            {useMicrophone && (
              <div className="max-w-md mx-auto mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {micStatus === "listening" ? (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33B0AA] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#33B0AA]" />
                      </span>
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-[#FD903B]" />
                    )}
                    <span className="font-semibold text-[#0E2453]">
                      {micStatus === "listening"
                        ? "Microphone Active (Speak to Start)"
                        : micStatus === "denied"
                        ? "Microphone Blocked"
                        : "Microphone Inactive"}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#FD903B]">{currentVolume}% Level</span>
                </div>

                <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-75 ${
                      currentVolume >= threshold ? "bg-[#33B0AA]" : "bg-[#3980BE]"
                    }`}
                    style={{ width: `${currentVolume}%` }}
                  />
                  {/* Threshold marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[#FD903B]"
                    style={{ left: `${threshold}%` }}
                    title={`Trigger threshold: ${threshold}%`}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {useMicrophone ? (
                micStatus !== "listening" ? (
                  <button
                    onClick={startAudioMonitoring}
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#0E2453] hover:bg-[#163678] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition shadow-md shadow-[#0E2453]/20"
                  >
                    <Mic className="w-5 h-5 text-[#33B0AA]" /> Enable Microphone & Begin
                  </button>
                ) : (
                  <button
                    onClick={stopAudioMonitoring}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-[#0E2453] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <MicOff className="w-4 h-4 text-[#FD903B]" /> Stop Mic Monitoring
                  </button>
                )
              ) : (
                <button
                  onClick={toggleManualPhonation}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition shadow-md ${
                    isPhonating
                      ? "bg-[#DC8357] hover:bg-[#c96e42] text-white animate-pulse"
                      : "bg-[#0E2453] hover:bg-[#163678] text-white shadow-[#0E2453]/20"
                  }`}
                >
                  {isPhonating ? (
                    <>
                      <Square className="w-5 h-5 fill-current" /> Stop Phonation
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current text-[#FFA33E]" /> Start Sustained Voice
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trial History & Progress Tracker */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Trial History (Best of 3)</h3>
              <p className="text-xs text-slate-500">Clinical standard recommends 3 consecutive trials.</p>
            </div>
            {trials.length > 0 && (
              <button
                onClick={resetTrials}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset History
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[0, 1, 2].map((idx) => {
              const trialScore = trials[idx];
              const isBest = trialScore !== undefined && trialScore === bestDuration && bestDuration > 0;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center transition ${
                    trialScore !== undefined
                      ? isBest
                        ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200"
                        : "bg-slate-50 border-slate-200"
                      : "bg-slate-50/50 border-dashed border-slate-200 text-slate-400"
                  }`}
                >
                  <span className="block text-[11px] font-semibold uppercase text-slate-400">
                    Trial {idx + 1}
                  </span>
                  <div className="text-xl font-mono font-bold text-slate-800 mt-1">
                    {trialScore !== undefined ? `${trialScore}s` : "—"}
                  </div>
                  {isBest && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full mt-1">
                      <Award className="w-3 h-3" /> Best
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Clinical Norm Analysis Box */}
          {normFeedback && (
            <div className={`p-4 rounded-xl border text-sm ${normFeedback.color} transition`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{normFeedback.level}</span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">{normFeedback.message}</p>
              <div className="mt-2 text-xs font-semibold opacity-75">
                Session Summary: Best = {bestDuration}s | Average = {avgDuration}s
              </div>
            </div>
          )}

          {/* Educational Note */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex gap-3 text-xs text-slate-600">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Why MPT Matters: </span>
              Maximum Phonation Time evaluates how efficiently your respiratory and laryngeal systems
              work together. Healthy vocal folds create a complete seal to regulate airflow smoothly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
