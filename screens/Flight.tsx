import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { BatteryMedium, ChevronLeft, Images, Signal } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Compass } from "@/components/Flight/Compass";
import { Glass } from "@/components/Flight/Glass";
import { MiniMap } from "@/components/Flight/MiniMap";
import { Reticle } from "@/components/Flight/Reticle";
import { Telemetry } from "@/components/Flight/Telemetry";
import { Rise } from "@/components/Rise";
import { CRUISE, DRONE, MISSIONS } from "@/constants/data";
import { useFlightStore } from "@/stores/useFlightStore";
import { flight } from "@/utils/flightMotion";
import { colors, fonts } from "@/utils/theme";

const FEED = require("@/assets/img/valley.jpg");
const THUMB = 54;
const CONTROLS = 82;
const SPECS = ["4K · 60", "f/2.8", "ISO 100"];

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

interface FlightProps {
  onLand: () => void;
}

export const Flight = ({ onLand }: FlightProps) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const phase = useFlightStore((s) => s.phase);
  const mission = useFlightStore((s) => s.mission);
  const shots = useFlightStore((s) => s.shots);
  const addShot = useFlightStore((s) => s.addShot);
  const autoCapture = useFlightStore((s) => s.autoCapture);
  const live = phase === "flying";
  const [seconds, setSeconds] = useState(0);

  const drift = useSharedValue(0);
  const heading = useSharedValue(236);
  const blink = useSharedValue(1);
  const flash = useSharedValue(0);
  const ghost = useSharedValue(0);
  const badge = useSharedValue(1);
  const press = useSharedValue(1);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
    blink.value = withRepeat(withSequence(withTiming(0.25, { duration: 520 }), withTiming(1, { duration: 520 })), -1);
  }, [drift, blink]);

  useEffect(() => {
    if (!live) {
      heading.value = withTiming(236, { duration: 300 });
      setSeconds(0);
      return;
    }
    heading.value = withSequence(
      withTiming(CRUISE.heading, { duration: 2600, easing: Easing.out(Easing.cubic) }),
      withRepeat(withSequence(withTiming(CRUISE.heading + 9, { duration: 3200, easing: Easing.inOut(Easing.sin) }), withTiming(CRUISE.heading - 7, { duration: 3200, easing: Easing.inOut(Easing.sin) })), -1, true),
    );
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [live, heading]);

  const bottom = Math.max(insets.bottom, 12) + 10;
  const thumbX = 20 + THUMB / 2 - width / 2;
  const thumbY = height - bottom - CONTROLS / 2 - height / 2;

  const capture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    flash.value = withSequence(withTiming(1, { duration: 60 }), withTiming(0, { duration: 340, easing: Easing.out(Easing.quad) }));
    ghost.value = 0;
    ghost.value = withDelay(90, withTiming(1, { duration: 620, easing: Easing.inOut(Easing.cubic) }));
    setTimeout(() => {
      addShot();
      badge.value = withSequence(withTiming(1.5, { duration: 110 }), withSpring(1, { damping: 7, stiffness: 240 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 690);
  };

  useEffect(() => {
    if (autoCapture) capture();
    // capture only reads shared values, so the cue is the one thing to react to
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCapture]);

  const layer = useAnimatedStyle(() => ({ opacity: interpolate(flight.value, [1.3, 2], [0, 1], Extrapolation.CLAMP) }));
  const feed = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(flight.value, [1.3, 2], [1.5, 1.16], Extrapolation.CLAMP) + drift.value * 0.05 },
      { translateX: (drift.value - 0.5) * 22 },
      { translateY: (drift.value - 0.5) * -30 },
      { rotate: `${(drift.value - 0.5) * 1.6}deg` },
    ],
  }));
  const rec = useAnimatedStyle(() => ({ opacity: blink.value }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value * 0.9 }));
  const ghostStyle = useAnimatedStyle(() => ({
    opacity: ghost.value === 0 || ghost.value === 1 ? 0 : 1,
    borderRadius: interpolate(ghost.value, [0, 1], [0, 160]),
    transform: [{ translateX: thumbX * ghost.value }, { translateY: thumbY * ghost.value }, { scale: interpolate(ghost.value, [0, 1], [1, THUMB / width]) }, { rotate: `${ghost.value * -8}deg` }],
  }));
  const shutter = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badge.value }] }));

  const missionName = (MISSIONS.find((m) => m.id === mission)?.title ?? "").replace("\n", " ").toUpperCase();

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.screen, layer]} pointerEvents={live ? "auto" : "none"}>
      <Animated.View style={[StyleSheet.absoluteFill, feed]}>
        <Image source={FEED} style={styles.fill} resizeMode="cover" />
      </Animated.View>
      <LinearGradient colors={["rgba(6,8,12,0.72)", "rgba(6,8,12,0)"]} style={[styles.shade, { top: 0, height: 250 }]} pointerEvents="none" />
      <LinearGradient colors={["rgba(6,8,12,0)", "rgba(6,8,12,0.82)"]} style={[styles.shade, { bottom: 0, height: 420 }]} pointerEvents="none" />

      <View style={[styles.top, { top: insets.top + 6 }]}>
        <Rise show={live} delay={80} style={styles.topRow}>
          <Pressable onPress={onLand} hitSlop={10}>
            <Glass style={styles.pill}>
              <ChevronLeft size={18} color={colors.white} strokeWidth={2.6} />
              <Text style={styles.pillText}>Return</Text>
            </Glass>
          </Pressable>
          <Glass style={styles.pill}>
            <Animated.View style={[styles.recDot, rec]} />
            <Text style={styles.mono}>REC {clock(seconds)}</Text>
          </Glass>
          <Glass style={styles.pill}>
            <Signal size={15} color={colors.white} strokeWidth={2.6} />
            <BatteryMedium size={19} color={colors.white} strokeWidth={2.2} />
            <Text style={styles.mono}>{DRONE.battery}%</Text>
          </Glass>
        </Rise>
        <Rise show={live} delay={200} style={styles.compass}>
          <Compass heading={heading} width={width} />
        </Rise>
      </View>

      <View style={[styles.center, { top: height * 0.3 }]} pointerEvents="none">
        <Reticle live={live} label={`${missionName} · LOCKED`} />
      </View>

      <View style={[styles.bottom, { bottom }]}>
        <Rise show={live} delay={320} style={styles.sideRow}>
          <MiniMap live={live} mission={mission} />
          <View style={styles.specs}>
            {SPECS.map((s) => (
              <Glass key={s} style={styles.spec}>
                <Text style={styles.specText}>{s}</Text>
              </Glass>
            ))}
          </View>
        </Rise>
        <Rise show={live} delay={420} style={styles.telemetry}>
          <Telemetry live={live} />
        </Rise>
        <Rise show={live} delay={520} style={styles.controls}>
          <View style={styles.thumb}>
            {shots > 0 ? <Image source={FEED} style={styles.fill} resizeMode="cover" /> : <Images size={20} color="rgba(255,255,255,0.7)" />}
            {shots > 0 && (
              <Animated.View style={[styles.badge, badgeStyle]}>
                <Text style={styles.badgeText}>{shots}</Text>
              </Animated.View>
            )}
          </View>
          <Pressable
            onPressIn={() => (press.value = withSpring(0.86, { damping: 14, stiffness: 340 }))}
            onPressOut={() => (press.value = withSpring(1, { damping: 8, stiffness: 260 }))}
            onPress={capture}
          >
            <View style={styles.shutterRing}>
              <Animated.View style={[styles.shutter, shutter]} />
            </View>
          </Pressable>
          <Glass style={styles.mode}>
            <Text style={styles.modeText}>PHOTO</Text>
          </Glass>
        </Rise>
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, styles.ghost, ghostStyle]} pointerEvents="none">
        <Image source={FEED} style={styles.fill} resizeMode="cover" />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} pointerEvents="none" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  screen: { backgroundColor: "#06080C", overflow: "hidden" },
  fill: { width: "100%", height: "100%" },
  shade: { position: "absolute", left: 0, right: 0 },
  top: { position: "absolute", left: 0, right: 0 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  pill: { flexDirection: "row", alignItems: "center", gap: 7, height: 42, paddingHorizontal: 14, borderRadius: 21 },
  pillText: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.white },
  mono: { fontFamily: fonts.monoBold, fontSize: 12.5, color: colors.white, letterSpacing: 0.4 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.rec },
  compass: { marginTop: 18 },
  center: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  bottom: { position: "absolute", left: 16, right: 16 },
  sideRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  specs: { gap: 8, alignItems: "flex-end" },
  spec: { height: 30, paddingHorizontal: 12, borderRadius: 15, justifyContent: "center" },
  specText: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.white, letterSpacing: 0.8 },
  telemetry: { marginTop: 12 },
  controls: { height: CONTROLS, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingHorizontal: 4 },
  thumb: { width: THUMB, height: THUMB, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 2, borderColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center", overflow: "visible" },
  badge: { position: "absolute", right: -7, top: -7, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  badgeText: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.white },
  shutterRing: { width: 78, height: 78, borderRadius: 39, borderWidth: 3.5, borderColor: colors.white, alignItems: "center", justifyContent: "center" },
  shutter: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.white },
  mode: { width: 78, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  modeText: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.white, letterSpacing: 1.6 },
  ghost: { overflow: "hidden", borderWidth: 3, borderColor: colors.white },
  flash: { backgroundColor: colors.white },
});
