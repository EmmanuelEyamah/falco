import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors } from "@/utils/theme";

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const Toggle = ({ value, onChange }: ToggleProps) => {
  const on = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    on.value = withSpring(value ? 1 : 0, { damping: 15, stiffness: 220 });
  }, [value, on]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(on.value, [0, 1], ["#DADDE3", colors.ink]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: on.value * 22 }, { scaleX: 1 + Math.sin(on.value * Math.PI) * 0.18 }] }));
  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(!value);
      }}
    >
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, knob]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: { width: 52, height: 30, borderRadius: 15, padding: 3 },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
});
