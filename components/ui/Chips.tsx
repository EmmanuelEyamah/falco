import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { colors, fonts, shadow } from "@/utils/theme";

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const Chip = ({ label, active, onPress }: ChipProps) => {
  const on = useSharedValue(active ? 1 : 0);
  const press = useSharedValue(1);
  useEffect(() => {
    on.value = withTiming(active ? 1 : 0, { duration: 260 });
  }, [active, on]);
  const box = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(on.value, [0, 1], [colors.card, colors.ink]), transform: [{ scale: press.value }] }));
  const text = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.ink, colors.white]) }));
  return (
    <Pressable onPress={onPress} onPressIn={() => (press.value = withSpring(0.92, { damping: 16, stiffness: 320 }))} onPressOut={() => (press.value = withSpring(1, { damping: 9, stiffness: 240 }))}>
      <Animated.View style={[styles.chip, box]}>
        <Animated.Text style={[styles.text, text]}>{label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

interface ChipsProps<T extends string> {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export const Chips = <T extends string>({ items, value, onChange }: ChipsProps<T>) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
    {items.map((item) => (
      <Chip
        key={item}
        label={item}
        active={item === value}
        onPress={() => {
          Haptics.selectionAsync();
          onChange(item);
        }}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8, paddingVertical: 6 },
  chip: { height: 40, paddingHorizontal: 18, borderRadius: 20, justifyContent: "center", ...shadow.card, shadowOpacity: 0.05 },
  text: { fontFamily: fonts.semibold, fontSize: 13 },
});
