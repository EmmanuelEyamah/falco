import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { colors, fonts } from "@/utils/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const RING = 2 * Math.PI * 5;
const ROTORS = [
  { cx: 8, cy: 8 },
  { cx: 24, cy: 8 },
  { cx: 24, cy: 24 },
  { cx: 8, cy: 24 },
];
const LETTERS = ["F", "A", "L", "C", "O"];

interface RotorProps {
  cx: number;
  cy: number;
  index: number;
}
const Rotor = ({ cx, cy, index }: RotorProps) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(120 + index * 90, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [index, t]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: RING * (1 - t.value) }));
  return <AnimatedCircle cx={cx} cy={cy} r={5} stroke={colors.ink} strokeWidth={2.4} strokeDasharray={RING} animatedProps={props} strokeLinecap="round" />;
};

interface LetterProps {
  char: string;
  index: number;
}
const Letter = ({ char, index }: LetterProps) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(620 + index * 60, withSpring(1, { damping: 14, stiffness: 160 }));
  }, [index, t]);
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ translateY: (1 - t.value) * 18 }] }));
  return <Animated.Text style={[styles.letter, style]}>{char}</Animated.Text>;
};

interface SplashProps {
  onReveal: () => void;
}

/** The mark draws itself, the name rises letter by letter, then the whole sheet opens onto the app. */
export const Splash = ({ onReveal }: SplashProps) => {
  const [gone, setGone] = useState(false);
  const arms = useSharedValue(0);
  const hub = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    arms.value = withDelay(380, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    hub.value = withDelay(560, withSpring(1, { damping: 9, stiffness: 180 }));
    exit.value = withDelay(1500, withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) }));
    const reveal = setTimeout(onReveal, 1480);
    const done = setTimeout(() => setGone(true), 2080);
    return () => {
      clearTimeout(reveal);
      clearTimeout(done);
    };
  }, [arms, hub, exit, onReveal]);

  const armProps = useAnimatedProps(() => ({ strokeDashoffset: 28 * (1 - arms.value) }));
  const hubProps = useAnimatedProps(() => ({ r: 3.6 * hub.value }));
  const sheet = useAnimatedStyle(() => ({ opacity: 1 - exit.value }));
  const lockup = useAnimatedStyle(() => ({ transform: [{ scale: 1 + exit.value * 0.35 }], opacity: 1 - exit.value * 1.6 }));

  if (gone) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.sheet, sheet]} pointerEvents="none">
      <Animated.View style={[styles.lockup, lockup]}>
        <Svg width={84} height={84} viewBox="0 0 32 32" fill="none">
          <AnimatedPath d="M11.2 11.2 20.8 20.8M20.8 11.2 11.2 20.8" stroke={colors.ink} strokeWidth={2.4} strokeLinecap="round" strokeDasharray={28} animatedProps={armProps} />
          {ROTORS.map((r, i) => (
            <Rotor key={i} cx={r.cx} cy={r.cy} index={i} />
          ))}
          <AnimatedCircle cx={16} cy={16} fill={colors.accent} animatedProps={hubProps} />
        </Svg>
        <View style={styles.word}>
          {LETTERS.map((c, i) => (
            <Letter key={c} char={c} index={i} />
          ))}
        </View>
        <Text style={styles.tag}>FLIGHT CONTROL</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: { backgroundColor: colors.card, alignItems: "center", justifyContent: "center", zIndex: 50 },
  lockup: { alignItems: "center" },
  word: { flexDirection: "row", marginTop: 22 },
  letter: { fontFamily: fonts.black, fontSize: 34, letterSpacing: 9, color: colors.ink, marginLeft: 9 },
  tag: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 4, color: colors.muted, marginTop: 10 },
});
