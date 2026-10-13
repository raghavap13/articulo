"use client";

import { Patient, Prescription, ExerciseType, LetterRecording } from "./types";

const STORAGE_KEY = "articulo_patients_v2";
const ACTIVE_PATIENT_KEY = "articulo_active_patient_id";

// Helper to generate a lightweight playable WAV data URL for initial demo seed / fallback
export function generateToneWavDataUrl(frequency = 440, durationSeconds = 1.2): string {
  if (typeof window === "undefined") return "";
  try {
    const sampleRate = 8000;
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.min(1, t * 10) * Math.max(0, 1 - (t / durationSeconds) * 0.8);
      // Harmonic vowel-like wave
      const wave =
        0.6 * Math.sin(2 * Math.PI * frequency * t) +
        0.3 * Math.sin(2 * Math.PI * frequency * 2 * t) +
        0.1 * Math.sin(2 * Math.PI * frequency * 3 * t);
      const sample = Math.max(-1, Math.min(1, wave * envelope * 0.5));
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:audio/wav;base64,${window.btoa(binary)}`;
  } catch {
    return "";
  }
}

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Elena Rostova",
    age: 58,
    diagnosis: "Post-Stroke Flaccid Dysarthria & Breathiness",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    therapistName: "Dr. Rachel Vance, CCC-SLP",
    streakDays: 4,
    prescriptions: [
      {
        id: "rx-alpha-1",
        patientId: "p1",
        exerciseType: "alphabet",
        title: "A–Z Alphabet Phonetic Articulation",
        targetMetric: "Listen & record clear articulation for letters A–Z",
        frequency: "Daily",
        therapistNote:
          "Listen to each letter prompt first, then speak clearly into your microphone. Exaggerate lip and tongue placement.",
        completedToday: false,
        completedCount: 1,
      },
      {
        id: "rx-1",
        patientId: "p1",
        exerciseType: "tone",
        title: "Auditory Pitch Match Baseline",
        targetMetric: "Identify 500 Hz speech baseline (5 trials)",
        frequency: "Daily (Morning)",
        therapistNote: "Calibrate frequency awareness before voice output to reduce compensatory straining.",
        completedToday: true,
        completedCount: 1,
        lastCompletedAt: "Today at 9:15 AM",
      },
      {
        id: "rx-2",
        patientId: "p1",
        exerciseType: "ddk",
        title: "Diadochokinetic SMR Rate Coach",
        targetMetric: "Achieve ≥ 4.0 reps/sec for PA-TA-KA",
        frequency: "2x Daily (Afternoon & Evening)",
        therapistNote: "Focus on crisp alveolar contact for /t/ and velar closure for /k/. Avoid breath holding.",
        completedToday: false,
        completedCount: 0,
      },
      {
        id: "rx-3",
        patientId: "p1",
        exerciseType: "mpt",
        title: "Maximum Phonation Time (Vowel /a/)",
        targetMetric: "Target: ≥ 14.0 seconds duration",
        frequency: "Daily (Evening)",
        therapistNote: "Maintain comfortable conversational pitch. Take deep diaphragmatic breath first.",
        completedToday: false,
        completedCount: 0,
      },
    ],
    history: [
      {
        id: "h-1",
        date: "Yesterday",
        exerciseType: "mpt",
        exerciseTitle: "Maximum Phonation Time",
        result: "13.6s (Best trial)",
      },
      {
        id: "h-2",
        date: "Yesterday",
        exerciseType: "ddk",
        exerciseTitle: "DDK Motor Pacing",
        result: "3.8 reps/sec",
      },
      {
        id: "h-3",
        date: "2 days ago",
        exerciseType: "tone",
        exerciseTitle: "Tone Discrimination",
        result: "100% accuracy",
      },
    ],
    alphabetRecordings: {},
  },
  {
    id: "p2",
    name: "Marcus Vance",
    age: 67,
    diagnosis: "Parkinson's Disease (Hypophonia & Rate Festination)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    therapistName: "Dr. Rachel Vance, CCC-SLP",
    streakDays: 2,
    prescriptions: [
      {
        id: "rx-alpha-2",
        patientId: "p2",
        exerciseType: "alphabet",
        title: "High-Projection Alphabet Articulation (A–Z)",
        targetMetric: "Record A–Z with strong vocal projection",
        frequency: "Daily",
        therapistNote: "Listen to the audio cue and project each letter clearly as if speaking across a room.",
        completedToday: false,
        completedCount: 0,
      },
      {
        id: "rx-4",
        patientId: "p2",
        exerciseType: "mpt",
        title: "High-Effort Vowel Hold (/a/)",
        targetMetric: "Target: ≥ 18.0 seconds sustained phonation",
        frequency: "2x Daily",
        therapistNote: "Focus on high phonatory effort and full glottal closure to counter vocal cord bowing.",
        completedToday: true,
        completedCount: 1,
        lastCompletedAt: "Today at 11:30 AM",
      },
      {
        id: "rx-5",
        patientId: "p2",
        exerciseType: "ddk",
        title: "Steady-State DDK Pacing",
        targetMetric: "Maintain steady rhythm (target 3.2 - 3.8 reps/sec)",
        frequency: "Daily",
        therapistNote: "Do not rush. Prioritize rhythm regularity over absolute maximum speed.",
        completedToday: false,
        completedCount: 0,
      },
    ],
    history: [
      {
        id: "h-4",
        date: "Today",
        exerciseType: "mpt",
        exerciseTitle: "High-Effort Vowel Hold",
        result: "16.4s",
      },
      {
        id: "h-5",
        date: "Yesterday",
        exerciseType: "ddk",
        exerciseTitle: "Steady-State DDK",
        result: "3.4 reps/sec",
      },
    ],
    alphabetRecordings: {},
  },
];

export function getStoredPatients(): Patient[] {
  if (typeof window === "undefined") return INITIAL_PATIENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial sample recordings for A and B on p1 so therapist view has immediate playable demo data
      const seeded = INITIAL_PATIENTS.map((p) => {
        if (p.id === "p1") {
          return {
            ...p,
            alphabetRecordings: {
              A: {
                letter: "A",
                word: "Apple",
                audioDataUrl: generateToneWavDataUrl(220, 1.4),
                recordedAt: "Today, 9:20 AM",
                durationSec: 1.4,
              },
              B: {
                letter: "B",
                word: "Ball",
                audioDataUrl: generateToneWavDataUrl(247, 1.3),
                recordedAt: "Today, 9:21 AM",
                durationSec: 1.3,
              },
            },
          };
        }
        return p;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PATIENTS;
  }
}

export function saveStoredPatients(patients: Patient[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    window.dispatchEvent(new Event("articulo-storage-update"));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

export function getActivePatient(): Patient {
  const patients = getStoredPatients();
  if (typeof window === "undefined") return patients[0];
  const activeId = localStorage.getItem(ACTIVE_PATIENT_KEY) || "p1";
  return patients.find((p) => p.id === activeId) || patients[0];
}

export function setActivePatientId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_PATIENT_KEY, id);
  window.dispatchEvent(new Event("articulo-storage-update"));
}

export function saveLetterRecording(patientId: string, recording: LetterRecording): void {
  const patients = getStoredPatients();
  const updated = patients.map((patient) => {
    if (patient.id !== patientId) return patient;
    const existingRecordings = patient.alphabetRecordings || {};
    return {
      ...patient,
      alphabetRecordings: {
        ...existingRecordings,
        [recording.letter]: recording,
      },
    };
  });
  saveStoredPatients(updated);
}

export function addPrescription(
  patientId: string,
  prescriptionData: Omit<Prescription, "id" | "patientId" | "completedToday" | "completedCount">
): void {
  const patients = getStoredPatients();
  const updated = patients.map((patient) => {
    if (patient.id !== patientId) return patient;
    const newRx: Prescription = {
      ...prescriptionData,
      id: `rx-${Date.now()}`,
      patientId,
      completedToday: false,
      completedCount: 0,
    };
    return {
      ...patient,
      prescriptions: [...patient.prescriptions, newRx],
    };
  });
  saveStoredPatients(updated);
}

export function removePrescription(patientId: string, prescriptionId: string): void {
  const patients = getStoredPatients();
  const updated = patients.map((patient) => {
    if (patient.id !== patientId) return patient;
    return {
      ...patient,
      prescriptions: patient.prescriptions.filter((rx) => rx.id !== prescriptionId),
    };
  });
  saveStoredPatients(updated);
}

export function completePrescription(
  patientId: string,
  prescriptionId: string,
  resultSummary: string,
  audioDataUrl?: string
): void {
  const patients = getStoredPatients();
  const updated = patients.map((patient) => {
    if (patient.id !== patientId) return patient;
    let completedRxTitle = "Exercise";
    let completedRxType: ExerciseType = "mpt";

    const updatedRxList = patient.prescriptions.map((rx) => {
      if (rx.id !== prescriptionId) return rx;
      completedRxTitle = rx.title;
      completedRxType = rx.exerciseType;
      return {
        ...rx,
        completedToday: true,
        completedCount: rx.completedCount + 1,
        lastCompletedAt: "Just now",
      };
    });

    const newHistoryItem = {
      id: `h-${Date.now()}`,
      date: "Today",
      exerciseType: completedRxType,
      exerciseTitle: completedRxTitle,
      result: resultSummary,
      audioDataUrl,
    };

    return {
      ...patient,
      prescriptions: updatedRxList,
      history: [newHistoryItem, ...patient.history],
    };
  });
  saveStoredPatients(updated);
}
