// One palette, light only: the app is a concept piece and the film is shot in light mode.
export const colors = {
  bg: "#ECEEF2",
  card: "#FFFFFF",
  ink: "#0A0B0D",
  inkSoft: "#1B1D21",
  muted: "#8B909A",
  faint: "#C9CDD4",
  line: "#E6E8EC",
  accent: "#FF6B1A",
  accentSoft: "#FFE7D9",
  good: "#16B36A",
  rec: "#FF3B30",
  white: "#FFFFFF",
  glass: "rgba(12,13,16,0.42)",
  glassLine: "rgba(255,255,255,0.18)",
} as const;

export const fonts = {
  regular: "Sora_400Regular",
  medium: "Sora_500Medium",
  semibold: "Sora_600SemiBold",
  bold: "Sora_700Bold",
  black: "Sora_800ExtraBold",
  mono: "JetBrainsMono_500Medium",
  monoBold: "JetBrainsMono_700Bold",
} as const;

export const radius = { sm: 12, md: 18, lg: 26, xl: 34, pill: 999 } as const;

export const shadow = {
  card: { shadowColor: "#1A1F2B", shadowOpacity: 0.07, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  lift: { shadowColor: "#0A0B0D", shadowOpacity: 0.28, shadowRadius: 22, shadowOffset: { width: 0, height: 14 }, elevation: 10 },
} as const;
