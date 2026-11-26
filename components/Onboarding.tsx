import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions, type ImageSourcePropType } from "react-native";
import Animated, { Easing, Extrapolation, interpolate, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSpring, withTiming, scrollTo, runOnUI, type SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { LogoMark } from "@/components/LogoMark";
import { AUTOPILOT, ONBOARDING } from "@/constants/data";
import { colors, fonts } from "@/utils/theme";

const PHOTOS: (ImageSourcePropType | null)[] = [require("@/assets/img/dunes.jpg"), require("@/assets/img/coast.jpg"), null];
const LAST = ONBOARDING.length - 1;

interface LayerProps {
  index: number;
  scrollX: SharedValue<number>;
  drift: SharedValue<number>;
  width: number;
}

// One full-bleed backdrop per page. They cross-fade and slide a little slower than the words, which gives the depth.
const Backdrop = ({ index, scrollX, drift, width }: LayerProps) => {
  const photo = PHOTOS[index];
  const style = useAnimatedStyle(() => {
    const offset = scrollX.value - index * width;
    return {
      opacity: interpolate(offset, [-width, 0, width], [0, 1, 0], Extrapolation.CLAMP),
      transform: [{ translateX: -offset * 0.18 }, { scale: 1.12 + drift.value * 0.06 }],
    };
  });
  const craft = useAnimatedStyle(() => {
    const offset = scrollX.value - index * width;
    return { transform: [{ translateX: -offset * 0.5 }, { translateY: (drift.value - 0.5) * 16 }, { rotate: `${(drift.value - 0.5) * 3}deg` }] };
  });

  if (photo) {
    return (
      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Image source={photo} style={styles.fill} resizeMode="cover" />
      </Animated.View>
    );
  }
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.studio, style]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="spot" cx="50%" cy="36%" rx="75%" ry="42%">
            <Stop offset="0" stopColor="#3A3D45" stopOpacity={1} />
            <Stop offset="0.55" stopColor="#17181C" stopOpacity={1} />
            <Stop offset="1" stopColor="#08090B" stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#spot)" />
      </Svg>
      <Animated.View style={[styles.craft, { width: width * 0.92, height: width * 0.92 * (570 / 1400) }, craft]}>
        <Image source={require("@/assets/img/drone.png")} style={styles.fill} resizeMode="contain" />
      </Animated.View>
    </Animated.View>
  );
};

interface PageProps {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
  bottom: number;
}

const Page = ({ index, scrollX, width, bottom }: PageProps) => {
  const page = ONBOARDING[index];
  const shift = (factor: number) => () => {
    "worklet";
    const offset = scrollX.value - index * width;
    return { opacity: interpolate(Math.abs(offset), [0, width * 0.6], [1, 0], Extrapolation.CLAMP), transform: [{ translateX: offset * factor }] };
  };
  const eyebrow = useAnimatedStyle(shift(0.15));
  const title = useAnimatedStyle(shift(0.3));
  const body = useAnimatedStyle(shift(0.5));

  return (
    <View style={[styles.page, { width, paddingBottom: bottom }]}>
      <Animated.View style={[styles.eyebrowRow, eyebrow]}>
        <Text style={styles.index}>{page.index}</Text>
        <View style={styles.dash} />
        <Text style={styles.eyebrow}>{page.eyebrow}</Text>
      </Animated.View>
      <Animated.Text style={[styles.title, title]}>{page.title}</Animated.Text>
      <Animated.Text style={[styles.body, body]}>{page.body}</Animated.Text>
    </View>
  );
};

interface BarProps {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}
const Bar = ({ index, scrollX, width }: BarProps) => {
  const fill = useAnimatedStyle(() => ({ width: `${interpolate(scrollX.value / width, [index - 1, index], [0, 100], Extrapolation.CLAMP)}%` }));
  return (
    <View style={styles.bar}>
      <Animated.View style={[styles.barFill, fill]} />
    </View>
  );
};

interface OnboardingProps {
  onDone: () => void;
}

/** Three quiet pages over full-bleed footage, then the sheet lifts away to the app. */
export const Onboarding = ({ onDone }: OnboardingProps) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ref = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const drift = useSharedValue(0);
  const intro = useSharedValue(0);
  const exit = useSharedValue(0);
  const press = useSharedValue(1);
  const page = useRef(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true);
    intro.value = withDelay(200, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [drift, intro]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const finish = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    exit.value = withTiming(1, { duration: 620, easing: Easing.inOut(Easing.cubic) });
    setTimeout(onDone, 260);
    setTimeout(() => setGone(true), 660);
  }, [exit, onDone]);

  const next = useCallback(() => {
    if (page.current >= LAST) {
      finish();
      return;
    }
    page.current += 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const x = page.current * width;
    runOnUI(() => {
      "worklet";
      scrollTo(ref, x, 0, true);
    })();
  }, [finish, ref, width]);

  useEffect(() => {
    if (!AUTOPILOT) return;
    const timers = [setTimeout(next, 2100), setTimeout(next, 4000), setTimeout(next, 6000)];
    return () => timers.forEach(clearTimeout);
  }, [next]);

  const sheet = useAnimatedStyle(() => ({ opacity: 1 - exit.value, transform: [{ scale: 1 + exit.value * 0.12 }, { translateY: -exit.value * 40 }] }));
  const chrome = useAnimatedStyle(() => ({ opacity: intro.value, transform: [{ translateY: (1 - intro.value) * 24 }] }));
  const head = useAnimatedStyle(() => ({ opacity: intro.value, transform: [{ translateY: (1 - intro.value) * -16 }] }));
  const button = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const labelNext = useAnimatedStyle(() => ({ opacity: interpolate(scrollX.value, [(LAST - 0.6) * width, (LAST - 0.2) * width], [1, 0], Extrapolation.CLAMP) }));
  const labelStart = useAnimatedStyle(() => ({ opacity: interpolate(scrollX.value, [(LAST - 0.6) * width, (LAST - 0.2) * width], [0, 1], Extrapolation.CLAMP) }));
  const arrow = useAnimatedStyle(() => ({ backgroundColor: scrollX.value > (LAST - 0.4) * width ? colors.accent : colors.ink, transform: [{ rotate: `${interpolate(scrollX.value, [(LAST - 1) * width, LAST * width], [0, -45], Extrapolation.CLAMP)}deg` }] }));

  if (gone) return null;

  const bottom = Math.max(insets.bottom, 16) + 96;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.sheet, sheet]}>
      {ONBOARDING.map((p, i) => (
        <Backdrop key={p.key} index={i} scrollX={scrollX} drift={drift} width={width} />
      ))}
      <LinearGradient colors={["rgba(5,6,8,0.55)", "rgba(5,6,8,0)"]} style={[styles.shade, { top: 0, height: 220 }]} pointerEvents="none" />
      <LinearGradient colors={["rgba(5,6,8,0)", "rgba(5,6,8,0.86)", "rgba(5,6,8,0.96)"]} locations={[0, 0.55, 1]} style={[styles.shade, { bottom: 0, height: 560 }]} pointerEvents="none" />

      <Animated.ScrollView ref={ref} horizontal pagingEnabled bounces={false} showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} onMomentumScrollEnd={(e) => (page.current = Math.round(e.nativeEvent.contentOffset.x / width))} style={StyleSheet.absoluteFill}>
        {ONBOARDING.map((p, i) => (
          <Page key={p.key} index={i} scrollX={scrollX} width={width} bottom={bottom + 34} />
        ))}
      </Animated.ScrollView>

      <Animated.View style={[styles.head, { top: insets.top + 10 }, head]} pointerEvents="box-none">
        <View style={styles.brand}>
          <LogoMark size={22} color={colors.white} />
          <Text style={styles.word}>FALCO</Text>
        </View>
        <Pressable onPress={finish} hitSlop={14}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.foot, { bottom: Math.max(insets.bottom, 16) + 6 }, chrome]} pointerEvents="box-none">
        <View style={styles.bars}>
          {ONBOARDING.map((p, i) => (
            <Bar key={p.key} index={i} scrollX={scrollX} width={width} />
          ))}
        </View>
        <Pressable
          onPressIn={() => (press.value = withSpring(0.96, { damping: 16, stiffness: 320 }))}
          onPressOut={() => (press.value = withSpring(1, { damping: 10, stiffness: 240 }))}
          onPress={next}
        >
          <Animated.View style={[styles.cta, button]}>
            <View style={styles.ctaLabel}>
              <Animated.Text style={[styles.ctaText, labelNext]}>Continue</Animated.Text>
              <Animated.Text style={[styles.ctaText, styles.ctaStack, labelStart]}>Start flying</Animated.Text>
            </View>
            <Animated.View style={[styles.arrow, arrow]}>
              <ArrowRight size={22} color={colors.white} strokeWidth={2.4} />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: { backgroundColor: "#08090B", zIndex: 40, overflow: "hidden" },
  fill: { width: "100%", height: "100%" },
  studio: { alignItems: "center" },
  craft: { marginTop: "52%" },
  shade: { position: "absolute", left: 0, right: 0 },
  page: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 26 },
  eyebrowRow: { flexDirection: "row", alignItems: "center" },
  index: { fontFamily: fonts.mono, fontSize: 12, color: colors.accent, letterSpacing: 1 },
  dash: { width: 26, height: 1, backgroundColor: "rgba(255,255,255,0.4)", marginHorizontal: 10 },
  eyebrow: { fontFamily: fonts.mono, fontSize: 11.5, letterSpacing: 3.2, color: "rgba(255,255,255,0.72)" },
  title: { fontFamily: fonts.semibold, fontSize: 43, lineHeight: 47, letterSpacing: -1.9, color: colors.white, marginTop: 18 },
  body: { fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 24, color: "rgba(255,255,255,0.66)", marginTop: 16, maxWidth: 330 },
  head: { position: "absolute", left: 24, right: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  word: { fontFamily: fonts.bold, fontSize: 14, letterSpacing: 5, color: colors.white },
  skip: { fontFamily: fonts.medium, fontSize: 14, color: "rgba(255,255,255,0.7)" },
  foot: { position: "absolute", left: 22, right: 22 },
  bars: { flexDirection: "row", gap: 6, marginBottom: 20, paddingHorizontal: 4 },
  bar: { flex: 1, height: 2.5, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.22)", overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: colors.white, borderRadius: 2 },
  cta: { height: 66, borderRadius: 33, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 28, paddingRight: 7 },
  ctaLabel: { justifyContent: "center", width: 180 },
  ctaText: { fontFamily: fonts.semibold, fontSize: 16.5, color: colors.ink, letterSpacing: -0.2 },
  ctaStack: { position: "absolute", left: 0, width: 180 },
  arrow: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
});
