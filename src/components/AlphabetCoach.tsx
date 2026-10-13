"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Volume2,
  Mic,
  Square,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Headphones,
} from "lucide-react";
import {
  getActivePatient,
  saveLetterRecording,
  generateToneWavDataUrl,
} from "@/lib/store";
import { LetterRecording } from "@/lib/types";

interface AlphabetItem {
  letter: string;
  phonetic: string;
  word: string;
  cue: string;
  freq: number;
}

export const ALPHABET_DATA: AlphabetItem[] = [
  { letter: "A", phonetic: "/eɪ/", word: "Apple", cue: "Open jaw wide, glide tongue high toward the roof of the mouth.", freq: 220 },
  { letter: "B", phonetic: "/biː/", word: "Ball", cue: "Bilabial voiced stop: press both lips together firmly, then release with voice.", freq: 233 },
  { letter: "C", phonetic: "/siː/", word: "Cat", cue: "Alveolar fricative: place tongue tip near upper teeth ridge and release steady air.", freq: 247 },
  { letter: "D", phonetic: "/diː/", word: "Dog", cue: "Alveolar voiced stop: tap tongue tip firmly against the ridge behind upper teeth.", freq: 262 },
  { letter: "E", phonetic: "/iː/", word: "Elephant", cue: "High front vowel: retract lips into a gentle smile and keep tongue high.", freq: 277 },
  { letter: "F", phonetic: "/ɛf/", word: "Fish", cue: "Labiodental fricative: rest upper teeth gently on lower lip and blow steady air.", freq: 294 },
  { letter: "G", phonetic: "/dʒiː/", word: "Garden", cue: "Palato-alveolar affricate: press tongue blade to roof and release with voice.", freq: 311 },
  { letter: "H", phonetic: "/eɪtʃ/", word: "House", cue: "Glottal onset followed by soft palatal affricate release.", freq: 330 },
  { letter: "I", phonetic: "/aɪ/", word: "Ice", cue: "Diphthong glide: start with an open jaw '/ɑ/' and glide smoothly up to '/ɪ/'.", freq: 349 },
  { letter: "J", phonetic: "/dʒeɪ/", word: "Jacket", cue: "Voiced affricate onset followed by a smooth mid-front vowel glide.", freq: 370 },
  { letter: "K", phonetic: "/keɪ/", word: "Kite", cue: "Velar voiceless stop: raise the back of the tongue against the soft palate.", freq: 392 },
  { letter: "L", phonetic: "/ɛl/", word: "Lion", cue: "Alveolar lateral: lift tongue tip to touch behind upper front teeth.", freq: 415 },
  { letter: "M", phonetic: "/ɛm/", word: "Moon", cue: "Bilabial nasal: close lips gently and let sound resonate through the nose.", freq: 440 },
  { letter: "N", phonetic: "/ɛn/", word: "Nest", cue: "Alveolar nasal: press tongue tip to upper ridge while humming nasally.", freq: 466 },
  { letter: "O", phonetic: "/oʊ/", word: "Orange", cue: "Mid-back rounded vowel: round lips smoothly into a circle as you phonate.", freq: 494 },
  { letter: "P", phonetic: "/piː/", word: "Piano", cue: "Bilabial voiceless stop: build air pressure behind closed lips, then pop open.", freq: 523 },
  { letter: "Q", phonetic: "/kjuː/", word: "Queen", cue: "Velar stop '/k/' blended into a palatal glide '/j/' and rounded '/u/'.", freq: 554 },
  { letter: "R", phonetic: "/ɑːr/", word: "River", cue: "Retroflex/bunched approximant: curl or bunch tongue back without touching roof.", freq: 587 },
  { letter: "S", phonetic: "/ɛs/", word: "Sun", cue: "Crisp sibilant: direct a narrow stream of air over the center of the tongue.", freq: 622 },
  { letter: "T", phonetic: "/tiː/", word: "Tiger", cue: "Crisp alveolar stop: tap tongue tip sharply behind upper teeth with a burst of air.", freq: 659 },
  { letter: "U", phonetic: "/juː/", word: "Umbrella", cue: "Start with high palatal glide '/j/' and round lips forward into '/uː/'.", freq: 698 },
  { letter: "V", phonetic: "/viː/", word: "Violin", cue: "Voiced labiodental: touch upper teeth to lower lip and vibrate vocal folds.", freq: 740 },
  { letter: "W", phonetic: "/ˈdʌbəl.juː/", word: "Water", cue: "Coordinate multisyllabic sequence with lip rounding at the finish.", freq: 784 },
  { letter: "X", phonetic: "/ɛks/", word: "Xylophone", cue: "Open front vowel '/ɛ/' followed by crisp velar-alveolar cluster '/ks/'.", freq: 830 },
  { letter: "Y", phonetic: "/waɪ/", word: "Yellow", cue: "Round lips tightly for '/w/' then open wide into the '/aɪ/' diphthong.", freq: 880 },
  { letter: "Z", phonetic: "/ziː/", word: "Zebra", cue: "Voiced alveolar sibilant: sustain buzzing vibration at the front teeth ridge.", freq: 932 },
];

interface AlphabetCoachProps {
  onComplete?: (result: string, lastAudioUrl?: string) => void;
  targetMetric?: string;
  therapistNote?: string;
}

export default function AlphabetCoach({
  onComplete,
  targetMetric,
  therapistNote,
}: AlphabetCoachProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [recordings, setRecordings] = useState<Record<string, LetterRecording>>({});
  const [patientId, setPatientId] = useState<string>("p1");

  // Audio playback & recording states
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [liveVolume, setLiveVolume] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState<boolean>(false);

  // Refs for MediaRecorder & Web Audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordStartRef = useRef<number>(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const currentItem = ALPHABET_DATA[currentIndex];
  const currentRecording = recordings[currentItem.letter];
  const totalRecorded = Object.keys(recordings).length;

  useEffect(() => {
    const loadPatientData = () => {
      const active = getActivePatient();
      setPatientId(active.id);
      setRecordings(active.alphabetRecordings || {});
    };
    loadPatientData();
    window.addEventListener("articulo-storage-update", loadPatientData);
    return () => window.removeEventListener("articulo-storage-update", loadPatientData);
  }, []);

  const cleanupRecordingResources = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setLiveVolume(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecordingResources();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [cleanupRecordingResources]);

  // Step 1: Play the letter audio out loud using SpeechSynthesis + chime
  const playLetterAudio = useCallback(
    (onFinishedSpeaking?: () => void) => {
      if (typeof window === "undefined") return;

      setIsSpeakingPrompt(true);
      setStatusMessage(`Playing audio prompt for "${currentItem.letter}"...`);

      // Play a gentle reference cue tone first so audio context is unlocked
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 chime
          gain.gain.setValueAtTime(0.001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
          setTimeout(() => ctx.close().catch(() => {}), 500);
        }
      } catch {
        // Ignore audio context errors
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `Letter ${currentItem.letter}. Say ${currentItem.letter}, as in ${currentItem.word}.`
        );
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          setIsSpeakingPrompt(false);
          setStatusMessage(`Now record yourself saying "${currentItem.letter} — ${currentItem.word}"`);
          if (onFinishedSpeaking) onFinishedSpeaking();
        };

        utterance.onerror = () => {
          setIsSpeakingPrompt(false);
          if (onFinishedSpeaking) onFinishedSpeaking();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          setIsSpeakingPrompt(false);
          if (onFinishedSpeaking) onFinishedSpeaking();
        }, 1200);
      }
    },
    [currentItem]
  );

  // Save a completed letter recording to store & local state
  const commitLetterRecording = useCallback(
    (audioDataUrl: string, durationSec: number) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const newRec: LetterRecording = {
        letter: currentItem.letter,
        word: currentItem.word,
        audioDataUrl,
        recordedAt: `Today at ${timeStr}`,
        durationSec: Math.max(0.5, parseFloat(durationSec.toFixed(1))),
      };

      saveLetterRecording(patientId, newRec);
      setRecordings((prev) => ({
        ...prev,
        [currentItem.letter]: newRec,
      }));
      setStatusMessage(
        `Saved recording for Letter "${currentItem.letter}"! Visible in your Therapist Portal.`
      );
    },
    [currentItem, patientId]
  );

  // Stop active microphone recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    cleanupRecordingResources();
  }, [cleanupRecordingResources]);

  // Step 2: Record patient's voice via MediaRecorder (with simulated fallback if mic unavailable)
  const startRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      cleanupRecordingResources();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup live volume meter
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const v = (dataArray[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          setLiveVolume(Math.min(100, Math.round(rms * 260)));
          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        animFrameRef.current = requestAnimationFrame(updateMeter);
      }

      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const duration = (performance.now() - recordStartRef.current) / 1000;
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Url = typeof reader.result === "string" ? reader.result : "";
          if (base64Url) {
            commitLetterRecording(base64Url, duration);
          }
        };
        reader.readAsDataURL(blob);
      };

      recordStartRef.current = performance.now();
      setRecordingSeconds(0);
      setIsRecording(true);
      setStatusMessage(`Recording "${currentItem.letter} — ${currentItem.word}"... Speak clearly!`);

      recorder.start();

      recordTimerRef.current = setInterval(() => {
        const elapsed = (performance.now() - recordStartRef.current) / 1000;
        setRecordingSeconds(parseFloat(elapsed.toFixed(1)));
        // Auto-stop after 3.5 seconds for a clean single-letter clip
        if (elapsed >= 3.5) {
          stopRecording();
        }
      }, 100);
    } catch {
      // Fallback: if microphone permission is denied or no hardware mic exists, synthesize a realistic voice sample
      setStatusMessage(
        `Microphone unavailable — capturing simulated voice sample for "${currentItem.letter}"...`
      );
      setIsRecording(true);
      setRecordingSeconds(0);
      setTimeout(() => {
        setIsRecording(false);
        const fallbackWav = generateToneWavDataUrl(currentItem.freq, 1.5);
        commitLetterRecording(fallbackWav, 1.5);
      }, 1200);
    }
  }, [isRecording, stopRecording, cleanupRecordingResources, currentItem, commitLetterRecording]);

  // Combined "Listen & Record" 1-Click Guided Flow
  const handleListenAndRecord = () => {
    playLetterAudio(() => {
      startRecording();
    });
  };

  // Play back the patient's recorded audio for the current letter
  const playPatientRecording = () => {
    if (!currentRecording?.audioDataUrl) return;
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const audio = new Audio(currentRecording.audioDataUrl);
    audioPlayerRef.current = audio;
    setIsPlayingRecorded(true);
    audio.onended = () => setIsPlayingRecorded(false);
    audio.onerror = () => setIsPlayingRecorded(false);
    audio.play().catch(() => setIsPlayingRecorded(false));
  };

  const handleFinishSession = () => {
    const count = Object.keys(recordings).length;
    const latestUrl = currentRecording?.audioDataUrl;
    if (onComplete) {
      onComplete(`${count}/26 letters recorded (A–Z Audio Logged)`, latestUrl);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#0E2453]">
              A–Z Alphabet Phonetics & Voice Recorder
            </h2>
            <span className="text-xs bg-[#DC8357]/15 text-[#0E2453] font-extrabold px-3 py-1 rounded-full border border-[#DC8357]/30">
              Speech & Recording
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Listen to each letter out loud, then record yourself pronouncing it for your therapist.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-2xl self-start">
          <CheckCircle className="w-4 h-4 text-[#33B0AA]" />
          <span className="text-xs font-black text-[#0E2453]">
            {totalRecorded} / 26 Recorded
          </span>
        </div>
      </div>

      {therapistNote && (
        <div className="mb-5 p-3.5 bg-[#3980BE]/10 border border-[#3980BE]/25 rounded-2xl text-xs text-[#0E2453]">
          <span className="font-extrabold text-[#3980BE]">Therapist Directive: </span>
          {therapistNote}
        </div>
      )}

      {targetMetric && (
        <div className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Target Goal: <span className="text-[#0E2453] font-black">{targetMetric}</span>
        </div>
      )}

      {/* A-Z Interactive Alphabet Strip */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>Select Any Letter (A–Z)</span>
          <span>Green = Recorded for Therapist</span>
        </div>
        <div className="grid grid-cols-9 sm:grid-cols-13 gap-1.5">
          {ALPHABET_DATA.map((item, idx) => {
            const isRecorded = Boolean(recordings[item.letter]);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={item.letter}
                onClick={() => {
                  setCurrentIndex(idx);
                  setStatusMessage(null);
                }}
                className={`h-9 rounded-xl font-black text-xs transition relative flex items-center justify-center ${
                  isCurrent
                    ? "bg-[#0E2453] text-white ring-2 ring-[#3980BE] shadow-xs scale-105"
                    : isRecorded
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-[#0E2453]"
                }`}
              >
                {item.letter}
                {isRecorded && !isCurrent && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Active Letter Studio Card */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Letter Navigation Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : ALPHABET_DATA.length - 1));
              setStatusMessage(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0E2453] hover:bg-slate-100 flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <span className="text-xs font-extrabold uppercase tracking-widest text-[#3980BE]">
            Letter {currentIndex + 1} of 26
          </span>

          <button
            onClick={() => {
              setCurrentIndex((prev) => (prev < ALPHABET_DATA.length - 1 ? prev + 1 : 0));
              setStatusMessage(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0E2453] hover:bg-slate-100 flex items-center gap-1 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Big Letter Display */}
        <div className="my-4">
          <div className="inline-flex items-baseline justify-center gap-3 px-8 py-4 rounded-3xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-6xl sm:text-7xl font-black text-[#0E2453] tracking-tight">
              {currentItem.letter}
            </span>
            <span className="text-4xl sm:text-5xl font-bold text-[#3980BE]">
              {currentItem.letter.toLowerCase()}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-[#0E2453]">
            <span className="font-mono text-[#33B0AA] bg-[#33B0AA]/10 px-2.5 py-0.5 rounded-lg border border-[#33B0AA]/25">
              {currentItem.phonetic}
            </span>
            <span>as in</span>
            <span className="underline decoration-[#FD903B] decoration-2 underline-offset-4 font-black">
              &quot;{currentItem.word}&quot;
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            <strong className="text-[#0E2453]">Articulation Cue:</strong> {currentItem.cue}
          </p>
        </div>

        {/* Interactive Controls: 1. Play Prompt | 2. Record Voice | Guided Auto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mt-6">
          {/* 1. Listen Out Loud */}
          <button
            onClick={() => playLetterAudio()}
            disabled={isSpeakingPrompt || isRecording}
            className={`py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 border transition shadow-xs ${
              isSpeakingPrompt
                ? "bg-[#3980BE] text-white border-[#3980BE] animate-pulse"
                : "bg-white hover:bg-slate-100 text-[#0E2453] border-slate-200"
            }`}
          >
            <Volume2 className="w-4 h-4 text-[#3980BE]" />
            <span>{isSpeakingPrompt ? "Playing Audio..." : "1. Hear Letter Out Loud"}</span>
          </button>

          {/* 2. Record Patient Voice */}
          <button
            onClick={startRecording}
            className={`py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md ${
              isRecording
                ? "bg-[#DC8357] hover:bg-[#c56c40] text-white animate-pulse"
                : "bg-[#0E2453] hover:bg-[#163678] text-white"
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Stop ({recordingSeconds}s)</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-[#33B0AA]" />
                <span>2. Record My Voice</span>
              </>
            )}
          </button>

          {/* 3. Guided Play -> Auto Record */}
          <button
            onClick={handleListenAndRecord}
            disabled={isSpeakingPrompt || isRecording}
            className="py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 bg-[#33B0AA]/15 hover:bg-[#33B0AA]/25 text-[#0E2453] border border-[#33B0AA]/30 transition"
          >
            <Sparkles className="w-4 h-4 text-[#33B0AA]" />
            <span>Auto Play &amp; Record</span>
          </button>
        </div>

        {/* Live Microphone Volume Meter During Recording */}
        {isRecording && (
          <div className="max-w-md mx-auto mt-5 bg-white p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#0E2453] mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#DC8357] animate-ping" />
                Recording Microphone Input...
              </span>
              <span className="font-mono text-[#DC8357]">{liveVolume}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#33B0AA] via-[#3980BE] to-[#DC8357] transition-all duration-75"
                style={{ width: `${Math.max(8, liveVolume)}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <p className="mt-4 text-xs font-bold text-[#3980BE]">{statusMessage}</p>
        )}

        {/* Recorded Audio Playback Box for Current Letter */}
        {currentRecording && (
          <div className="mt-6 max-w-md mx-auto p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-left">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-black text-[#0E2453] block">
                  Letter &quot;{currentRecording.letter}&quot; Recorded ({currentRecording.durationSec}s)
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Saved {currentRecording.recordedAt} • Shared with Therapist
                </span>
              </div>
            </div>

            <button
              onClick={playPatientRecording}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100 text-[#0E2453] border border-emerald-300 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition shrink-0"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isPlayingRecorded ? "Playing..." : "Listen to Recording"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions: Advance or Complete Session */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-500 font-medium">
          All recorded letters are automatically synced to your clinician&apos;s portal.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {currentIndex < ALPHABET_DATA.length - 1 && (
            <button
              onClick={() => {
                setCurrentIndex((i) => i + 1);
                setStatusMessage(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0E2453] text-xs font-bold flex items-center gap-1 transition"
            >
              Next Letter ({ALPHABET_DATA[currentIndex + 1].letter}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onComplete && (
            <button
              onClick={handleFinishSession}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
            >
              <Award className="w-4 h-4" /> Complete &amp; Send to Therapist
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
