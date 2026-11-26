import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { Glass } from "@/components/Flight/Glass";
import { colors, radius } from "@/utils/theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const ROUTE = "M18 84 C 26 62, 44 70, 48 52 S 70 44, 66 28 S 86 22, 86 14";
const ROUTE_LENGTH = 150;
const CONTOURS = ["M-4 30 C 20 18, 40 40, 62 26 S 96 30, 110 16", "M-4 52 C 22 40, 38 62, 64 46 S 92 54, 110 40", "M-4 76 C 24 62, 44 86, 66 68 S 94 74, 110 62", "M-4 98 C 22 86, 46 106, 70 90 S 96 96, 110 84"];

interface MiniMapProps {
  live: boolean;
}

/** The route draws itself as the drone moves away from its home point. */
export const MiniMap = ({ live }: MiniMapProps) => {
  const draw = useSharedValue(0);
  const ping = useSharedValue(0);

  useEffect(() => {
    if (live) {
      draw.value = withDelay(600, withTiming(1, { duration: 5200, easing: Easing.out(Easing.quad) }));
      ping.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1, false);
    } else {
      draw.value = withTiming(0, { duration: 200 });
    }
  }, [live, draw, ping]);

  const route = useAnimatedProps(() => ({ strokeDashoffset: ROUTE_LENGTH * (1 - draw.value) }));
  const halo = useAnimatedStyle(() => ({ opacity: 0.6 * (1 - ping.value), transform: [{ scale: 1 + ping.value * 2.4 }] }));

  return (
    <Glass style={styles.map}>
      <Svg width={104} height={104} viewBox="0 0 104 104">
        {CONTOURS.map((d) => (
          <Path key={d} d={d} stroke="rgba(255,255,255,0.16)" strokeWidth={1} fill="none" />
        ))}
        <AnimatedPath d={ROUTE} stroke={colors.accent} strokeWidth={2.4} strokeLinecap="round" fill="none" strokeDasharray={ROUTE_LENGTH} animatedProps={route} />
        <Circle cx={18} cy={84} r={3.4} fill={colors.white} />
      </Svg>
      <View style={styles.home} pointerEvents="none">
        <Animated.View style={[styles.halo, halo]} />
      </View>
    </Glass>
  );
};

const styles = StyleSheet.create({
  map: { width: 104, height: 104, borderRadius: radius.md },
  home: { position: "absolute", left: 18 - 5, top: 84 - 5, width: 10, height: 10, alignItems: "center", justifyContent: "center" },
  halo: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.white },
});
