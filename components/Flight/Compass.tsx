import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { colors, fonts } from "@/utils/theme";

const STEP = 15;
const GAP = 46;
const CARDINAL: Record<number, string> = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" };
// Two full turns so the tape can slide without running out.
const TICKS = Array.from({ length: (720 / STEP) + 1 }, (_, i) => i * STEP);

interface CompassProps {
  heading: SharedValue<number>;
  width: number;
}

export const Compass = ({ heading, width }: CompassProps) => {
  const tape = useAnimatedStyle(() => ({ transform: [{ translateX: width / 2 - ((heading.value + 360) / STEP) * GAP - GAP / 2 }] }));
  return (
    <View style={[styles.wrap, { width }]}>
      <Animated.View style={[styles.tape, tape]}>
        {TICKS.map((deg) => {
          const d = deg % 360;
          const name = CARDINAL[d];
          return (
            <View key={deg} style={styles.tick}>
              <View style={[styles.line, name ? styles.lineMajor : null]} />
              <Text style={[styles.label, name ? styles.labelMajor : null]}>{name ?? d}</Text>
            </View>
          );
        })}
      </Animated.View>
      <View style={styles.caret} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { height: 40, overflow: "hidden" },
  tape: { flexDirection: "row", position: "absolute", left: 0, top: 6 },
  tick: { width: GAP, alignItems: "center" },
  line: { width: 1.5, height: 7, backgroundColor: "rgba(255,255,255,0.45)", borderRadius: 1 },
  lineMajor: { height: 11, backgroundColor: colors.white },
  label: { fontFamily: fonts.mono, fontSize: 9.5, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  labelMajor: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.white },
  caret: { position: "absolute", alignSelf: "center", top: 0, width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: colors.accent },
});
