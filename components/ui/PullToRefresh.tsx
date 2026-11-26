import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { StyleSheet, Text, View, type ScrollViewProps } from "react-native";
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, interpolateColor, runOnJS, useAnimatedProps, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { AUTOPILOT_PULL } from "@/constants/data";
import { useFlightStore } from "@/stores/useFlightStore";
import { colors, fonts } from "@/utils/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TRIGGER = 92;
const HOLD = 96;
const SIZE = 58;
const R = 26;
const LENGTH = 2 * Math.PI * R;
const SYNC_MS = 1700;

type Status = "pull" | "release" | "syncing" | "done";
const WORDS: Record<Status, string> = { pull: "PULL TO SYNC", release: "RELEASE TO SYNC", syncing: "SYNCING WITH FALCO X2", done: "UP TO DATE" };

interface RotorProps {
  x: number;
  y: number;
  turn: SharedValue<number>;
  reverse?: boolean;
}

// One propeller of the little drone: a ring with a blade that turns.
const Rotor = ({ x, y, turn, reverse = false }: RotorProps) => {
  const blade = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * (reverse ? -1 : 1)}deg` }] }));
  return (
    <View style={[styles.rotor, { left: x, top: y }]}>
      <Animated.View style={[styles.blade, blade]} />
    </View>
  );
};

interface PullToRefreshProps extends Omit<ScrollViewProps, "onScroll"> {
  /** Runs when the pull is released past the trigger. The indicator stays open until it settles. */
  onRefresh: () => void;
  /** Called when the sync animation has finished and the list has closed again. */
  onSettled?: () => void;
  /** Receives the scroll offset, for screens that also animate on scroll. */
  scrollY?: SharedValue<number>;
  children: ReactNode;
}

/**
 * Pull-to-refresh with its own indicator: a small drone whose propellers turn as you pull,
 * a ring that fills to the trigger point, then it hovers while it syncs and lands on a tick.
 */
export const PullToRefresh = ({ onRefresh, onSettled, scrollY, children, ...scroll }: PullToRefreshProps) => {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<Status>("pull");
  const busy = useRef(false);

  const offset = useSharedValue(0);
  const hold = useSharedValue(0);
  const syncing = useSharedValue(0);
  const done = useSharedValue(0);
  const spin = useSharedValue(0);
  const hover = useSharedValue(0);
  // Autopilot only: stands in for a finger so the indicator can be played without touching the screen.
  const ghost = useSharedValue(0);

  const settle = useCallback(() => {
    setStatus("done");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    cancelAnimation(spin);
    cancelAnimation(hover);
    done.value = withSpring(1, { damping: 11, stiffness: 190 });
    hold.value = withDelay(620, withTiming(0, { duration: 420, easing: Easing.inOut(Easing.cubic) }));
    setTimeout(() => {
      syncing.value = 0;
      done.value = 0;
      spin.value = 0;
      hover.value = 0;
      busy.current = false;
      setStatus("pull");
      onSettled?.();
    }, 1100);
  }, [done, hold, hover, onSettled, spin, syncing]);

  const begin = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setStatus("syncing");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onRefresh();
    setTimeout(settle, SYNC_MS);
  }, [onRefresh, settle]);

  const tick = useCallback((ready: boolean) => {
    if (busy.current) return;
    setStatus(ready ? "release" : "pull");
    if (ready) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      offset.value = e.contentOffset.y;
      if (scrollY) scrollY.value = e.contentOffset.y;
    },
    onEndDrag: (e) => {
      if (e.contentOffset.y < -TRIGGER && syncing.value === 0) {
        syncing.value = 1;
        hold.value = withSpring(HOLD, { damping: 16, stiffness: 160 });
        spin.value = withRepeat(withTiming(360, { duration: 520, easing: Easing.linear }), -1, false);
        hover.value = withRepeat(withSequence(withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 520, easing: Easing.inOut(Easing.quad) })), -1);
        runOnJS(begin)();
      }
    },
  });

  const startSync = useCallback(() => {
    syncing.value = 1;
    hold.value = withSpring(HOLD, { damping: 16, stiffness: 160 });
    spin.value = withRepeat(withTiming(360, { duration: 520, easing: Easing.linear }), -1, false);
    hover.value = withRepeat(withSequence(withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 520, easing: Easing.inOut(Easing.quad) })), -1);
    begin();
  }, [begin, hold, hover, spin, syncing]);

  const phase = useFlightStore((s) => s.phase);
  const demoed = useRef(false);
  useEffect(() => {
    if (!AUTOPILOT_PULL || phase !== "home" || demoed.current) return;
    demoed.current = true;
    const pull = setTimeout(() => (ghost.value = withTiming(TRIGGER + 26, { duration: 1300, easing: Easing.out(Easing.cubic) })), 2200);
    const release = setTimeout(() => {
      ghost.value = withTiming(0, { duration: 260 });
      startSync();
    }, 3900);
    return () => {
      clearTimeout(pull);
      clearTimeout(release);
    };
  }, [ghost, phase, startSync]);

  // Tell the JS side when the pull crosses the trigger, so the caption and the haptic can follow.
  useAnimatedReaction(
    () => -offset.value + ghost.value > TRIGGER,
    (ready, was) => {
      if (ready !== was && syncing.value === 0) {
        runOnJS(tick)(ready);
      }
    },
  );

  const spacer = useAnimatedStyle(() => ({ height: hold.value + ghost.value }));

  const stage = useAnimatedStyle(() => {
    const pull = Math.max(0, -offset.value) + ghost.value + hold.value;
    const t = Math.min(1, pull / TRIGGER);
    return {
      opacity: interpolate(pull, [8, 46], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(pull, [0, TRIGGER, TRIGGER * 2.4], [-26, 0, 34], Extrapolation.CLAMP) + (hover.value - 0.5) * 7 }, { scale: 0.55 + t * 0.45 + done.value * 0.06 }],
    };
  });

  const ring = useAnimatedProps(() => {
    const pull = Math.max(0, -offset.value) + ghost.value + hold.value;
    const t = syncing.value ? 1 : Math.min(1, pull / TRIGGER);
    return { strokeDashoffset: LENGTH * (1 - t), stroke: interpolateColor(done.value, [0, 1], [t >= 1 ? colors.accent : colors.ink, colors.good]) };
  });

  const ringSpin = useAnimatedStyle(() => ({ transform: [{ rotate: `${-90 + spin.value * 0.5}deg` }] }));

  // While pulling the blades follow the finger; once syncing they run on their own.
  const turn = useSharedValue(0);
  useAnimatedReaction(
    () => (Math.max(0, -offset.value) + ghost.value) * 5 + spin.value * 3,
    (v) => {
      turn.value = v;
    },
  );

  const craft = useAnimatedStyle(() => ({ opacity: 1 - done.value, transform: [{ scale: 1 - done.value * 0.5 }, { rotate: `${done.value * 90}deg` }] }));
  const tickStyle = useAnimatedStyle(() => ({ opacity: done.value, transform: [{ scale: 0.4 + done.value * 0.6 }] }));
  const disc = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(done.value, [0, 1], [colors.card, colors.good]) }));
  const caption = useAnimatedStyle(() => {
    const pull = Math.max(0, -offset.value) + ghost.value + hold.value;
    return { opacity: interpolate(pull, [40, 78], [0, 1], Extrapolation.CLAMP), transform: [{ translateY: interpolate(pull, [40, TRIGGER], [-8, 0], Extrapolation.CLAMP) }] };
  });

  return (
    <View style={styles.wrap}>
      <View style={[styles.indicator, { top: insets.top + 8 }]} pointerEvents="none">
        <Animated.View style={[styles.stage, stage]}>
          <Animated.View style={[styles.disc, disc]} />
          <Animated.View style={[styles.ring, ringSpin]}>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.line} strokeWidth={3} fill="none" />
              <AnimatedCircle cx={SIZE / 2} cy={SIZE / 2} r={R} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={LENGTH} animatedProps={ring} />
            </Svg>
          </Animated.View>
          <Animated.View style={[styles.craft, craft]}>
            <View style={[styles.arm, { transform: [{ rotate: "45deg" }] }]} />
            <View style={[styles.arm, { transform: [{ rotate: "-45deg" }] }]} />
            <Rotor x={0} y={0} turn={turn} />
            <Rotor x={18} y={0} turn={turn} reverse />
            <Rotor x={0} y={18} turn={turn} reverse />
            <Rotor x={18} y={18} turn={turn} />
            <View style={styles.hub} />
          </Animated.View>
          <Animated.View style={[styles.tick, tickStyle]}>
            <Check size={26} color={colors.white} strokeWidth={3} />
          </Animated.View>
        </Animated.View>
        <Animated.View style={caption}>
          <Text style={[styles.caption, status === "release" && styles.captionReady, status === "done" && styles.captionDone]}>{WORDS[status]}</Text>
        </Animated.View>
      </View>

      <Animated.ScrollView {...scroll} onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} alwaysBounceVertical>
        <Animated.View style={spacer} />
        {children}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  indicator: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  stage: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  disc: { position: "absolute", width: SIZE - 8, height: SIZE - 8, borderRadius: SIZE / 2, shadowColor: "#1A1F2B", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  ring: { position: "absolute", left: 0, top: 0 },
  craft: { width: 30, height: 30 },
  arm: { position: "absolute", left: 14, top: 4, width: 2, height: 22, borderRadius: 1, backgroundColor: colors.ink },
  rotor: { position: "absolute", width: 12, height: 12, borderRadius: 6, borderWidth: 1.8, borderColor: colors.ink, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
  blade: { width: 9, height: 1.8, borderRadius: 1, backgroundColor: colors.accent },
  hub: { position: "absolute", left: 11.5, top: 11.5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.ink },
  tick: { position: "absolute" },
  caption: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2.2, color: colors.muted, marginTop: 10 },
  captionReady: { color: colors.accent },
  captionDone: { color: colors.good },
});
