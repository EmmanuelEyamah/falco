import * as Haptics from "expo-haptics";
import { ArrowUpRight, Clapperboard, Crosshair, Orbit, Route } from "lucide-react-native";
import { useEffect, type ComponentType } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import type { Mission, MissionId } from "@/types/flight";
import { colors, fonts, radius, shadow } from "@/utils/theme";

const ICONS: Record<MissionId, ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = { track: Crosshair, orbit: Orbit, waypoints: Route, master: Clapperboard };

interface MissionCardProps {
  mission: Mission;
  selected: boolean;
  onSelect: (id: MissionId) => void;
}

export const MissionCard = ({ mission, selected, onSelect }: MissionCardProps) => {
  const on = useSharedValue(selected ? 1 : 0);
  const press = useSharedValue(1);
  const Icon = ICONS[mission.id];

  useEffect(() => {
    on.value = withTiming(selected ? 1 : 0, { duration: 320 });
  }, [selected, on]);

  const card = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.value, [0, 1], [colors.card, colors.ink]),
    transform: [{ scale: press.value * (1 + on.value * 0.02) }],
    shadowOpacity: interpolate(on.value, [0, 1], [0.07, 0.3]),
  }));
  const tile = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(on.value, [0, 1], [colors.bg, "#26282D"]), transform: [{ rotate: `${on.value * 90}deg` }] }));
  const title = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.ink, colors.white]) }));
  const note = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.muted, "#9EA3AD"]) }));
  const chip = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(on.value, [0, 1], ["rgba(255,255,255,0)", colors.white]), transform: [{ scale: 0.9 + on.value * 0.1 }] }));
  const light = useAnimatedStyle(() => ({ opacity: on.value }));
  const dark = useAnimatedStyle(() => ({ opacity: 1 - on.value }));

  return (
    <Pressable
      style={styles.slot}
      onPressIn={() => (press.value = withSpring(0.94, { damping: 16, stiffness: 320 }))}
      onPressOut={() => (press.value = withSpring(1, { damping: 9, stiffness: 240 }))}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSelect(mission.id);
      }}
    >
      <Animated.View style={[styles.card, card]}>
        <Animated.View style={styles.top}>
          <Animated.View style={[styles.tile, tile]}>
            <Animated.View style={[styles.stack, dark]}>
              <Icon size={20} color={colors.ink} strokeWidth={2.2} />
            </Animated.View>
            <Animated.View style={[styles.stack, light]}>
              <Icon size={20} color={colors.white} strokeWidth={2.2} />
            </Animated.View>
          </Animated.View>
          <Animated.Text style={[styles.title, title]}>{mission.title}</Animated.Text>
        </Animated.View>
        <Animated.View style={styles.bottom}>
          <Animated.Text style={[styles.note, note]} numberOfLines={1}>
            {mission.note}
          </Animated.Text>
          <Animated.View style={[styles.chip, chip]}>
            <ArrowUpRight size={16} color={colors.ink} strokeWidth={2.6} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  slot: { width: "100%" },
  card: { borderRadius: radius.lg, padding: 14, height: 102, justifyContent: "space-between", ...shadow.card },
  top: { flexDirection: "row", alignItems: "center", gap: 11 },
  tile: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stack: { position: "absolute" },
  title: { fontFamily: fonts.bold, fontSize: 14.5, lineHeight: 18.5, letterSpacing: -0.2 },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  note: { fontFamily: fonts.regular, fontSize: 11.5, flex: 1 },
  chip: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
