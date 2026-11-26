import * as Haptics from "expo-haptics";
import { useMemo, useRef } from "react";
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors } from "@/utils/theme";

const KNOB = 28;
const TICKS = 21;

interface RangeSliderProps {
  /** 0 to 1. */
  value: number;
  onChange: (value: number) => void;
}

/** A ruled track with a knob that swells while it is held. */
export const RangeSlider = ({ value, onChange }: RangeSliderProps) => {
  const width = useRef(1);
  const start = useRef(0);
  const last = useRef(-1);
  const t = useSharedValue(value);
  const span = useSharedValue(1);
  const hold = useSharedValue(0);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          const next = Math.max(0, Math.min(1, (e.nativeEvent.locationX - KNOB / 2) / width.current));
          start.current = next;
          t.value = withSpring(next, { damping: 18, stiffness: 240 });
          hold.value = withSpring(1, { damping: 12, stiffness: 240 });
          onChange(next);
        },
        onPanResponderMove: (_, g) => {
          const next = Math.max(0, Math.min(1, start.current + g.dx / width.current));
          t.value = next;
          const step = Math.round(next * (TICKS - 1));
          if (step !== last.current) {
            last.current = step;
            Haptics.selectionAsync();
          }
          onChange(next);
        },
        onPanResponderRelease: () => {
          hold.value = withSpring(0, { damping: 12, stiffness: 240 });
        },
        onPanResponderTerminate: () => {
          hold.value = withSpring(0, { damping: 12, stiffness: 240 });
        },
      }),
    [hold, onChange, t],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    width.current = e.nativeEvent.layout.width - KNOB;
    span.value = width.current;
  };

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: t.value * span.value }, { scale: 1 + hold.value * 0.22 }] }));
  const fill = useAnimatedStyle(() => ({ width: t.value * span.value + KNOB / 2 }));

  return (
    <View style={styles.wrap} onLayout={onLayout} {...responder.panHandlers}>
      <View style={styles.ticks} pointerEvents="none">
        {Array.from({ length: TICKS }, (_, i) => (
          <View key={i} style={[styles.tick, i % 5 === 0 && styles.tickMajor]} />
        ))}
      </View>
      <View style={styles.rail} pointerEvents="none">
        <Animated.View style={[styles.fill, fill]} />
      </View>
      <Animated.View style={[styles.knob, knob]} pointerEvents="none">
        <View style={styles.pip} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { height: 54, justifyContent: "flex-end" },
  ticks: { position: "absolute", left: KNOB / 2, right: KNOB / 2, top: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 14 },
  tick: { width: 1.5, height: 6, borderRadius: 1, backgroundColor: colors.faint },
  tickMajor: { height: 12, backgroundColor: colors.muted },
  rail: { height: 6, borderRadius: 3, backgroundColor: colors.bg, marginBottom: 11, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.ink },
  knob: { position: "absolute", left: 0, bottom: 0, width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: colors.card, borderWidth: 2.5, borderColor: colors.ink, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  pip: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
});
