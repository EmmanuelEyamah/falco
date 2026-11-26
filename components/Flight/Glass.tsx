import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/utils/theme";

interface GlassProps {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/** Frosted panel that sits over the camera feed. */
export const Glass = ({ style, children }: GlassProps) => (
  <View style={[styles.shell, style]}>
    <BlurView intensity={38} tint="dark" style={StyleSheet.absoluteFill} />
    <View style={[StyleSheet.absoluteFill, styles.tint]} />
    {children}
  </View>
);

const styles = StyleSheet.create({
  shell: { overflow: "hidden", borderWidth: StyleSheet.hairlineWidth * 2, borderColor: colors.glassLine },
  tint: { backgroundColor: colors.glass },
});
