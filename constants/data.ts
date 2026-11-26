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
/** EXPO_PUBLIC_AUTOPILOT=pull plays one pull-to-refresh on the home screen. */
export const AUTOPILOT_PULL = process.env.EXPO_PUBLIC_AUTOPILOT === "pull";

export const ONBOARDING = [
  { key: "reach", index: "01", eyebrow: "RANGE", title: "Fly further.\nSee everything.", body: "Twelve kilometres of live 4K video, steady in winds that ground other drones." },
  { key: "missions", index: "02", eyebrow: "AI MISSIONS", title: "Shots that\nplan themselves.", body: "Pick a mission. Falco maps the route, holds the subject and brings itself home." },
  { key: "craft", index: "03", eyebrow: "FALCO X2", title: "Ready when\nyou are.", body: "249 grams. 22 minutes in the air. One slide to take off." },
] as const;

export const IMAGES = {
  valley: require("@/assets/img/valley.jpg"),
  coast: require("@/assets/img/coast.jpg"),
  dunes: require("@/assets/img/dunes.jpg"),
  ridge: require("@/assets/img/ridge.jpg"),
  falls: require("@/assets/img/falls.jpg"),
  terraces: require("@/assets/img/terraces.jpg"),
  lagoon: require("@/assets/img/lagoon.jpg"),
  city: require("@/assets/img/city.jpg"),
  lake: require("@/assets/img/lake.jpg"),
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
  { id: "c1", title: "Ridge at last light", place: "Aiguille du Midi", kind: "photo", image: "ridge", focus: { scale: 1, x: 0, y: 0 }, favourite: true },
  { id: "c2", title: "Coast road", place: "Madeira", kind: "video", image: "coast", focus: { scale: 1, x: 0, y: 0 }, length: "0:42" },
  { id: "c3", title: "Skógar falls", place: "Iceland", kind: "photo", image: "falls", focus: { scale: 1, x: 0, y: 0 }, favourite: true },
  { id: "c4", title: "Blue hour", place: "Downtown", kind: "video", image: "city", focus: { scale: 1, x: 0, y: 0 }, length: "1:18" },
  { id: "c5", title: "Hidden lagoon", place: "Maldives", kind: "photo", image: "lagoon", focus: { scale: 1, x: 0, y: 0 } },
  { id: "c6", title: "Rice terraces", place: "Sa Pa", kind: "video", image: "terraces", focus: { scale: 1, x: 0, y: 0 }, length: "0:27", favourite: true },
  { id: "c7", title: "Autumn lake", place: "Dolomites", kind: "photo", image: "lake", focus: { scale: 1, x: 0, y: 0 } },
  { id: "c8", title: "Empty quarter", place: "Liwa", kind: "photo", image: "dunes", focus: { scale: 1, x: 0, y: 0 } },
  { id: "c9", title: "Valley at dawn", place: "Lauterbrunnen", kind: "video", image: "valley", focus: { scale: 1, x: 0, y: 0 }, length: "0:54" },
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
