import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { colors, fonts, shadow } from "@/utils/theme";

interface LabelProps {
  label: string;
  active: boolean;
}
const Label = ({ label, active }: LabelProps) => {
  const on = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    on.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, on]);
  const style = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.muted, colors.white]) }));
  return <Animated.Text style={[styles.label, style]}>{label}</Animated.Text>;
};

interface SegmentedProps<T extends string> {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of options with one thumb that slides to the chosen one. */
export const Segmented = <T extends string>({ items, value, onChange }: SegmentedProps<T>) => {
  const [width, setWidth] = useState(0);
  const index = items.indexOf(value);
  const slot = width ? (width - 8) / items.length : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withSpring(index * slot, { damping: 17, stiffness: 190 });
  }, [index, slot, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {slot > 0 && <Animated.View style={[styles.thumb, { width: slot }, thumb]} />}
      {items.map((item) => (
        <Pressable
          key={item}
          style={styles.option}
          onPress={() => {
            Haptics.selectionAsync();
            onChange(item);
          }}
        >
          <Label label={item} active={item === value} />
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  track: { height: 48, borderRadius: 24, backgroundColor: colors.bg, flexDirection: "row", padding: 4 },
  thumb: { position: "absolute", left: 4, top: 4, bottom: 4, borderRadius: 20, backgroundColor: colors.ink, ...shadow.lift, shadowOpacity: 0.2 },
  option: { flex: 1, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: fonts.semibold, fontSize: 13 },
});
