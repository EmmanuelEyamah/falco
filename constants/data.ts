import type { Mission } from "@/types/flight";

export const DRONE = { name: "Falco X2", battery: 81, minutes: 22 } as const;

export const MISSIONS: Mission[] = [
  { id: "track", title: "Active\nTrack 360°", note: "One-tap autonomous" },
  { id: "orbit", title: "Hollywood\nOrbit", note: "Cinematic 360 POI" },
  { id: "waypoints", title: "Waypoints\nRTK", note: "Topographic control" },
  { id: "master", title: "Master\nShots Pro", note: "6 quick cinematics" },
];

export const WEATHER = [
  { key: "wind", label: "Wind", value: 3.4, unit: "m/s", decimals: 1 },
  { key: "vis", label: "Visibility", value: 10, unit: "km", decimals: 0, suffix: "+" },
  { key: "kp", label: "KP Index", value: 1.2, unit: "KP", decimals: 1 },
] as const;

// Where the flight settles once it is up: the numbers the film shows.
export const CRUISE = { altitude: 120, speed: 38, distance: 842, heading: 284 } as const;

// Set EXPO_PUBLIC_AUTOPILOT=1 to have the app run its own demo: handy for timing a recording.
export const AUTOPILOT = !!process.env.EXPO_PUBLIC_AUTOPILOT;
/** EXPO_PUBLIC_AUTOPILOT=tour walks the tabs instead of flying. */
export const AUTOPILOT_TOUR = process.env.EXPO_PUBLIC_AUTOPILOT === "tour";

export const ONBOARDING = [
  { key: "reach", index: "01", eyebrow: "RANGE", title: "Fly further.\nSee everything.", body: "Twelve kilometres of live 4K video, steady in winds that ground other drones." },
  { key: "missions", index: "02", eyebrow: "AI MISSIONS", title: "Shots that\nplan themselves.", body: "Pick a mission. Falco maps the route, holds the subject and brings itself home." },
  { key: "craft", index: "03", eyebrow: "FALCO X2", title: "Ready when\nyou are.", body: "249 grams. 22 minutes in the air. One slide to take off." },
] as const;

export const IMAGES = {
  valley: require("@/assets/img/valley.jpg"),
  coast: require("@/assets/img/coast.jpg"),
  dunes: require("@/assets/img/dunes.jpg"),
} as const;

export type ImageKey = keyof typeof IMAGES;
export type CaptureKind = "photo" | "video";

export interface CaptureItem {
  id: string;
  title: string;
  place: string;
  kind: CaptureKind;
  image: ImageKey;
  /** Which part of the frame the card shows, so one photograph can stand in for several shots. */
  focus: { scale: number; x: number; y: number };
  length?: string;
  favourite?: boolean;
}

export const CAPTURES: CaptureItem[] = [
  { id: "c1", title: "Valley at dawn", place: "Lauterbrunnen", kind: "photo", image: "valley", focus: { scale: 1, x: 0, y: 0 }, favourite: true },
  { id: "c2", title: "Coast road", place: "Madeira", kind: "video", image: "coast", focus: { scale: 1, x: 0, y: 0 }, length: "0:42" },
  { id: "c3", title: "Empty quarter", place: "Liwa", kind: "photo", image: "dunes", focus: { scale: 1, x: 0, y: 0 } },
  { id: "c4", title: "River bend", place: "Lauterbrunnen", kind: "video", image: "valley", focus: { scale: 2.1, x: 0, y: -0.28 }, length: "1:18", favourite: true },
  { id: "c5", title: "Breakers", place: "Madeira", kind: "photo", image: "coast", focus: { scale: 2.2, x: 0.2, y: 0.22 } },
  { id: "c6", title: "Dune lines", place: "Liwa", kind: "video", image: "dunes", focus: { scale: 2, x: -0.18, y: -0.2 }, length: "0:27" },
];

export const GALLERY_FILTERS = ["See all", "Photos", "Videos", "Favourites"] as const;

export const PILOT = { name: "Emmanuel Eyamah", initials: "EE", level: 7, progress: 0.68, flights: 128, hours: 46, distance: 912 } as const;

export const WEEK = [
  { day: "M", minutes: 18 },
  { day: "T", minutes: 34 },
  { day: "W", minutes: 12 },
  { day: "T", minutes: 48 },
  { day: "F", minutes: 27 },
  { day: "S", minutes: 56 },
  { day: "S", minutes: 39 },
] as const;
