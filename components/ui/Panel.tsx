import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, fonts, radius, shadow } from "@/utils/theme";

interface PanelProps {
  label?: string;
  value?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** White card with an optional small label and a live value on the right. */
export const Panel = ({ label, value, style, children }: PanelProps) => (
  <View style={[styles.panel, style]}>
    {label && (
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        {value && <Text style={styles.value}>{value}</Text>}
      </View>
    )}
    {children}
  </View>
);

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, marginHorizontal: 16, ...shadow.card },
  head: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 },
  label: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 2, color: colors.muted },
  value: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.ink },
});
