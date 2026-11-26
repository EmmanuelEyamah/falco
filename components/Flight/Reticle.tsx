import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { colors, fonts } from "@/utils/theme";

const SIZE = 168;
const ARM = 26;

interface ReticleProps {
  live: boolean;
  label: string;
}

/** Tracking box: snaps in from wide, then breathes while it holds the lock. */
export const Reticle = ({ live, label }: ReticleProps) => {
  const lock = useSharedValue(0);
  const breathe = useSharedValue(0);
  const scan = useSharedValue(0);

  useEffect(() => {
    if (live) {
      lock.value = withDelay(500, withSpring(1, { damping: 11, stiffness: 120 }));
      breathe.value = withDelay(1300, withRepeat(withSequence(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.quad) })), -1));
      scan.value = withDelay(700, withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true));
    } else {
      lock.value = withTiming(0, { duration: 200 });
      breathe.value = 0;
      scan.value = 0;
    }
  }, [live, lock, breathe, scan]);

  const box = useAnimatedStyle(() => ({ opacity: lock.value, transform: [{ scale: 1.7 - lock.value * 0.7 + breathe.value * 0.04 }, { rotate: `${(1 - lock.value) * -14}deg` }] }));
  const line = useAnimatedStyle(() => ({ opacity: lock.value * 0.75, transform: [{ translateY: scan.value * (SIZE - 16) }] }));
  const tag = useAnimatedStyle(() => ({ opacity: lock.value, transform: [{ translateY: (1 - lock.value) * 10 }] }));
  const dot = useAnimatedStyle(() => ({ opacity: 0.45 + breathe.value * 0.55 }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.box, box]}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        <Animated.View style={[styles.scan, line]} />
        <View style={styles.cross}>
          <View style={styles.crossH} />
          <View style={styles.crossV} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.tag, tag]}>
        <Animated.View style={[styles.dot, dot]} />
        <Text style={styles.tagText}>{label}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  box: { width: SIZE, height: SIZE },
  corner: { position: "absolute", width: ARM, height: ARM, borderColor: colors.white },
  tl: { left: 0, top: 0, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderTopLeftRadius: 10 },
  tr: { right: 0, top: 0, borderRightWidth: 2.5, borderTopWidth: 2.5, borderTopRightRadius: 10 },
  bl: { left: 0, bottom: 0, borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderBottomLeftRadius: 10 },
  br: { right: 0, bottom: 0, borderRightWidth: 2.5, borderBottomWidth: 2.5, borderBottomRightRadius: 10 },
  scan: { position: "absolute", left: 10, right: 10, top: 8, height: 1.5, backgroundColor: colors.accent, borderRadius: 1 },
  cross: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  crossH: { position: "absolute", width: 16, height: 1.5, backgroundColor: "rgba(255,255,255,0.9)" },
  crossV: { position: "absolute", width: 1.5, height: 16, backgroundColor: "rgba(255,255,255,0.9)" },
  tag: { flexDirection: "row", alignItems: "center", marginTop: 14, backgroundColor: "rgba(10,11,13,0.55)", paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.good, marginRight: 7 },
  tagText: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.6, color: colors.white },
});
