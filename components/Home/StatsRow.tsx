import { Gauge, Sun, Wind } from "lucide-react-native";
import type { ComponentType } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WEATHER } from "@/constants/data";
import { useCountUp } from "@/hooks/useCountUp";
import { colors, fonts, radius, shadow } from "@/utils/theme";

const ICONS: Record<string, ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = { wind: Wind, vis: Sun, kp: Gauge };

interface StatProps {
  label: string;
  value: number;
  unit: string;
  decimals: number;
  suffix?: string;
  icon: string;
  live: boolean;
  delay: number;
}

const Stat = ({ label, value, unit, decimals, suffix = "", icon, live, delay }: StatProps) => {
  const shown = useCountUp(live ? value : 0, 1000, delay);
  const Icon = ICONS[icon];
  return (
    <View style={styles.stat}>
      <View style={styles.icon}>
        <Icon size={18} color={colors.ink} strokeWidth={2.2} />
      </View>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {shown.toFixed(decimals)}
          {suffix} <Text style={styles.unit}>{unit}</Text>
        </Text>
      </View>
    </View>
  );
};

interface StatsRowProps {
  live: boolean;
}

export const StatsRow = ({ live }: StatsRowProps) => (
  <View style={styles.row}>
    {WEATHER.map((w, i) => (
      <View key={w.key} style={styles.cell}>
        {i > 0 && <View style={styles.rule} />}
        <Stat label={w.label} value={w.value} unit={w.unit} decimals={w.decimals} suffix={"suffix" in w ? w.suffix : ""} icon={w.key} live={live} delay={420 + i * 110} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginHorizontal: 16, backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: 15, ...shadow.card },
  cell: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  rule: { position: "absolute", left: 0, top: 6, bottom: 6, width: StyleSheet.hairlineWidth * 2, backgroundColor: colors.line },
  stat: { flexDirection: "row", alignItems: "center", gap: 9 },
  icon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: fonts.regular, fontSize: 10.5, color: colors.muted },
  value: { fontFamily: fonts.monoBold, fontSize: 14.5, color: colors.ink, marginTop: 2 },
  unit: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
});
