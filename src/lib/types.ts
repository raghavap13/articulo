export type ExerciseType = "tone" | "ddk" | "mpt" | "alphabet";

export interface LetterRecording {
  letter: string;
  word: string;
  audioDataUrl: string;
  recordedAt: string;
  durationSec: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  exerciseType: ExerciseType;
  title: string;
  targetMetric: string;
  frequency: string;
  therapistNote: string;
  completedToday: boolean;
  completedCount: number;
  lastCompletedAt?: string;
}

export interface SessionHistory {
  id: string;
  date: string;
  exerciseType: ExerciseType;
  exerciseTitle: string;
  result: string;
  audioDataUrl?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  avatar: string;
  therapistName: string;
  streakDays: number;
  prescriptions: Prescription[];
  history: SessionHistory[];
  alphabetRecordings?: Record<string, LetterRecording>;
}
