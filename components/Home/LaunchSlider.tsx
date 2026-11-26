import * as Haptics from "expo-haptics";
import { ChevronsRight } from "lucide-react-native";
import { useEffect, useMemo, useRef } from "react";
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { Easing, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from "react-native-reanimated";
import { colors, fonts } from "@/utils/theme";

const KNOB = 54;
const PAD = 5;

interface LaunchSliderProps {
  armed: boolean;
  /** Autopilot: bump this number to have the knob slide across by itself. */
  auto?: number;
  onLaunch: () => void;
}

/** Drag the knob across to take off. Letting go early springs it back. */
export const LaunchSlider = ({ armed, auto = 0, onLaunch }: LaunchSliderProps) => {
  const x = useSharedValue(0);
  const travel = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const range = useRef(1);
  const fired = useRef(false);
  const lastTick = useRef(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, [shimmer]);

  useEffect(() => {
    if (armed) {
      fired.current = false;
      x.value = withSpring(0, { damping: 16, stiffness: 150 });
    }
  }, [armed, x]);

  useEffect(() => {
    if (!auto || fired.current) return;
    fired.current = true;
    x.value = withTiming(range.current, { duration: 760, easing: Easing.inOut(Easing.cubic) });
    const timer = setTimeout(onLaunch, 780);
    return () => clearTimeout(timer);
  }, [auto, onLaunch, x]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !fired.current,
        onMoveShouldSetPanResponder: () => !fired.current,
        onPanResponderGrant: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onPanResponderMove: (_, g) => {
          const next = Math.max(0, Math.min(range.current, g.dx));
          x.value = next;
          const step = Math.floor((next / range.current) * 8);
          if (step !== lastTick.current) {
            lastTick.current = step;
            Haptics.selectionAsync();
          }
        },
        onPanResponderRelease: (_, g) => {
          const done = g.dx > range.current * 0.78;
          if (done) {
            fired.current = true;
            x.value = withSpring(range.current, { damping: 18, stiffness: 220 });
            onLaunch();
          } else {
            x.value = withSpring(0, { damping: 13, stiffness: 170 });
          }
        },
        onPanResponderTerminate: () => {
          x.value = withSpring(0, { damping: 13, stiffness: 170 });
        },
      }),
    [onLaunch, x],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    range.current = e.nativeEvent.layout.width - KNOB - PAD * 2;
    travel.value = range.current;
  };

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fill = useAnimatedStyle(() => ({ width: x.value + KNOB + PAD * 2, opacity: interpolate(x.value, [0, 14], [0, 1], "clamp") }));
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(x.value, [0, travel.value], ["#F1F2F5", "#E3E5EA"]) }));
  const label = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, travel.value * 0.55], [1, 0], "clamp"), transform: [{ translateX: x.value * 0.35 }] }));
  const armedLabel = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [travel.value * 0.6, travel.value], [0, 1], "clamp") }));
  const sweep = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, 20], [1, 0], "clamp"), transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-90, 300]) }, { skewX: "-18deg" }] }));

  return (
    <Animated.View style={[styles.track, track]} onLayout={onLayout}>
      <Animated.View style={[styles.fill, fill]} />
      <View style={styles.center} pointerEvents="none">
        <Animated.Text style={[styles.label, label]}>Slide to take off</Animated.Text>
        <Animated.Text style={[styles.label, styles.armed, armedLabel]}>Taking off</Animated.Text>
      </View>
      <View style={styles.sweepClip} pointerEvents="none">
        <Animated.View style={[styles.sweep, sweep]} />
      </View>
      <Animated.View style={[styles.knob, knob]} {...responder.panHandlers}>
        <ChevronsRight size={24} color={colors.white} strokeWidth={2.6} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  track: { height: KNOB + PAD * 2, borderRadius: (KNOB + PAD * 2) / 2, justifyContent: "center", overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: (KNOB + PAD * 2) / 2, backgroundColor: colors.ink },
  center: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", paddingLeft: KNOB * 0.5 },
  label: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink, letterSpacing: -0.1 },
  armed: { position: "absolute", color: colors.white },
  sweepClip: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, overflow: "hidden" },
  sweep: { position: "absolute", top: 0, bottom: 0, width: 46, backgroundColor: "rgba(255,255,255,0.55)" },
  knob: { position: "absolute", left: PAD, width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
});
