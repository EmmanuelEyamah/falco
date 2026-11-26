import { create } from "zustand";
import type { MissionId, Phase } from "@/types/flight";

interface FlightStore {
  phase: Phase;
  mission: MissionId;
  shots: number;
  /** Autopilot cues: each bump makes the matching control act as if it had been touched. */
  autoLaunch: number;
  autoCapture: number;
  setPhase: (phase: Phase) => void;
  setMission: (mission: MissionId) => void;
  addShot: () => void;
  cue: (control: "autoLaunch" | "autoCapture") => void;
}

export const useFlightStore = create<FlightStore>()((set) => ({
  phase: "splash",
  mission: "track",
  shots: 0,
  autoLaunch: 0,
  autoCapture: 0,
  setPhase: (phase) => set({ phase }),
  setMission: (mission) => set({ mission }),
  addShot: () => set((s) => ({ shots: s.shots + 1 })),
  cue: (control) => set((s) => ({ [control]: s[control] + 1 }) as Pick<FlightStore, typeof control>),
}));
