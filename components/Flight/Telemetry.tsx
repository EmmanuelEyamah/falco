import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Glass } from "@/components/Flight/Glass";
import { CRUISE } from "@/constants/data";
import { useCountUp } from "@/hooks/useCountUp";
import { colors, fonts, radius } from "@/utils/theme";

interface ReadoutProps {
  label: string;
  value: number;
  unit: string;
  pad: number;
}

const Readout = ({ label, value, unit, pad }: ReadoutProps) => (
  <View style={styles.cell}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>
      {String(Math.max(0, Math.round(value))).padStart(pad, "0")}
      <Text style={styles.unit}> {unit}</Text>
    </Text>
  </View>
);

interface TelemetryProps {
  live: boolean;
}

/** Altitude, speed and distance: they climb to cruise, then keep moving like a real feed. */
export const Telemetry = ({ live }: TelemetryProps) => {
  const [drift, setDrift] = useState({ alt: 0, spd: 0, dist: 0 });
  const altitude = useCountUp(live ? CRUISE.altitude : 0, 2200, 300);
  const speed = useCountUp(live ? CRUISE.speed : 0, 1800, 450);
  const distance = useCountUp(live ? CRUISE.distance : 0, 2600, 300);

  useEffect(() => {
    if (!live) {
      setDrift({ alt: 0, spd: 0, dist: 0 });
      return;
    }
    let n = 0;
    const timer = setInterval(() => {
      n += 1;
      setDrift({ alt: Math.round(Math.sin(n / 3) * 2), spd: Math.round(Math.sin(n / 2.2) * 2), dist: n * 4 });
    }, 320);
    return () => clearInterval(timer);
  }, [live]);

  return (
    <Glass style={styles.panel}>
      <Readout label="ALTITUDE" value={altitude + drift.alt} unit="m" pad={3} />
      <View style={styles.rule} />
      <Readout label="SPEED" value={speed + drift.spd} unit="km/h" pad={2} />
      <View style={styles.rule} />
      <Readout label="DISTANCE" value={distance + drift.dist} unit="m" pad={4} />
    </Glass>
  );
};

const styles = StyleSheet.create({
  panel: { flexDirection: "row", alignItems: "center", borderRadius: radius.lg, paddingVertical: 14 },
  cell: { flex: 1, alignItems: "center" },
  rule: { width: StyleSheet.hairlineWidth * 2, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  label: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.6, color: "rgba(255,255,255,0.6)" },
  value: { fontFamily: fonts.monoBold, fontSize: 22, color: colors.white, marginTop: 4, letterSpacing: -0.5 },
  unit: { fontFamily: fonts.mono, fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 0 },
});
