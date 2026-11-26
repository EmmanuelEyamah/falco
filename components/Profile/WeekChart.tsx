import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { Panel } from "@/components/ui/Panel";
import { WEEK } from "@/constants/data";
import { colors, fonts } from "@/utils/theme";

const HEIGHT = 118;
const PEAK = Math.max(...WEEK.map((d) => d.minutes));
const NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface BarProps {
  minutes: number;
  day: string;
  index: number;
  active: boolean;
  show: boolean;
  onPress: () => void;
}

const Bar = ({ minutes, day, index, active, show, onPress }: BarProps) => {
  const grow = useSharedValue(0);
  const on = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    grow.value = show ? withDelay(360 + index * 70, withSpring(1, { damping: 13, stiffness: 120 })) : withTiming(0, { duration: 150 });
  }, [show, index, grow]);
  useEffect(() => {
    on.value = withTiming(active ? 1 : 0, { duration: 240 });
  }, [active, on]);

  const bar = useAnimatedStyle(() => ({ height: Math.max(8, (minutes / PEAK) * HEIGHT * grow.value), backgroundColor: interpolateColor(on.value, [0, 1], ["#DFE2E8", colors.ink]) }));
  const label = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.muted, colors.ink]) }));

  return (
    <Pressable style={styles.slot} onPress={onPress} hitSlop={4}>
      <View style={styles.well}>
        <Animated.View style={[styles.bar, bar]} />
      </View>
      <Animated.Text style={[styles.day, label]}>{day}</Animated.Text>
    </Pressable>
  );
};

interface WeekChartProps {
  show: boolean;
}

export const WeekChart = ({ show }: WeekChartProps) => {
  const [picked, setPicked] = useState(5);
  const total = WEEK.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <Panel label="AIR TIME THIS WEEK" value={`${Math.floor(total / 60)} h ${total % 60} min`}>
      <View style={styles.readout}>
        <Text style={styles.big}>
          {WEEK[picked].minutes}
          <Text style={styles.unit}> min</Text>
        </Text>
        <Text style={styles.name}>{NAMES[picked]}</Text>
      </View>
      <View style={styles.chart}>
        {WEEK.map((d, i) => (
          <Bar
            key={i}
            minutes={d.minutes}
            day={d.day}
            index={i}
            active={i === picked}
            show={show}
            onPress={() => {
              Haptics.selectionAsync();
              setPicked(i);
            }}
          />
        ))}
      </View>
    </Panel>
  );
};

const styles = StyleSheet.create({
  readout: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  big: { fontFamily: fonts.black, fontSize: 34, letterSpacing: -1.4, color: colors.ink },
  unit: { fontFamily: fonts.medium, fontSize: 14, letterSpacing: 0, color: colors.muted },
  name: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  chart: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  slot: { flex: 1, alignItems: "center" },
  well: { height: HEIGHT, justifyContent: "flex-end" },
  bar: { width: 26, borderRadius: 13 },
  day: { fontFamily: fonts.mono, fontSize: 11, marginTop: 9 },
});
