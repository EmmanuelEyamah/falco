export type Phase = "splash" | "onboarding" | "home" | "launching" | "flying" | "landing";

export type MissionId = "track" | "orbit" | "waypoints" | "master";

export interface Mission {
  id: MissionId;
  title: string;
  note: string;
}
