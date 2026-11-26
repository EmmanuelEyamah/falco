import { Zap } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { LogoMark } from "@/components/LogoMark";
import { DRONE } from "@/constants/data";
import { useCountUp } from "@/hooks/useCountUp";
import { colors, fonts, shadow } from "@/utils/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const R = 17;
const LENGTH = 2 * Math.PI * R;

interface HeaderProps {
  live: boolean;
}

export const Header = ({ live }: HeaderProps) => {
  const pulse = useSharedValue(0);
  const ring = useSharedValue(0);
  const battery = useCountUp(live ? DRONE.battery : 0, 1100, 350);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }), -1, false);
  }, [pulse]);

  useEffect(() => {
    ring.value = live ? withDelay(350, withTiming(DRONE.battery / 100, { duration: 1100, easing: Easing.out(Easing.cubic) })) : 0;
  }, [live, ring]);

  const halo = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 2.2 }] }));
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - ring.value) }));

  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <LogoMark size={24} />
      </View>
      <View style={styles.names}>
        <Text style={styles.name}>{DRONE.name}</Text>
        <View style={styles.status}>
          <View style={styles.dotWrap}>
            <Animated.View style={[styles.halo, halo]} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.statusText}>CONNECTED</Text>
        </View>
      </View>
      <View style={styles.battery}>
        <View style={styles.ring}>
          <Svg width={40} height={40} viewBox="0 0 40 40" style={styles.ringSvg}>
            <Circle cx={20} cy={20} r={R} stroke={colors.line} strokeWidth={3} fill="none" />
            <AnimatedCircle cx={20} cy={20} r={R} stroke={colors.ink} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={LENGTH} animatedProps={ringProps} />
          </Svg>
          <Zap size={14} color={colors.ink} fill={colors.ink} />
        </View>
        <Text style={styles.percent}>{Math.round(battery)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, height: 56 },
  mark: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", ...shadow.card },
  names: { flex: 1, marginLeft: 12 },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.ink, letterSpacing: -0.3 },
  status: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  dotWrap: { width: 8, height: 8, alignItems: "center", justifyContent: "center", marginRight: 7 },
  halo: { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: colors.good },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.good },
  statusText: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.6, color: colors.muted },
  battery: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 26, paddingLeft: 6, paddingRight: 14, height: 52, ...shadow.card },
  ring: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  ringSvg: { position: "absolute", transform: [{ rotate: "-90deg" }] },
  percent: { fontFamily: fonts.monoBold, fontSize: 15, color: colors.ink, marginLeft: 8 },
});
