import { useEffect } from "react";
import { Image, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";
import { LaunchSlider } from "@/components/Home/LaunchSlider";
import { DRONE } from "@/constants/data";
import { flight, spin } from "@/utils/flightMotion";
import { colors, fonts, radius, shadow } from "@/utils/theme";

const DRONE_RATIO = 570 / 1400;

interface HeroCardProps {
  armed: boolean;
  auto?: number;
  onLaunch: () => void;
}

export const HeroCard = ({ armed, auto, onLaunch }: HeroCardProps) => {
  const { width, height } = useWindowDimensions();
  const cardWidth = width - 32;
  const droneWidth = cardWidth * 0.84;
  const droneHeight = droneWidth * DRONE_RATIO;
  const float = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
    shake.value = withRepeat(withTiming(1, { duration: 70, easing: Easing.linear }), -1, true);
  }, [float, shake]);

  const card = useAnimatedStyle(() => ({ opacity: interpolate(flight.value, [0.55, 1.15], [1, 0], Extrapolation.CLAMP) }));

  const drone = useAnimatedStyle(() => {
    const grounded = 1 - Math.min(1, flight.value);
    const bob = (float.value - 0.5) * 12 * (0.35 + grounded * 0.65);
    const buzz = (shake.value - 0.5) * 2.2 * spin.value;
    return {
      transform: [
        { translateY: interpolate(flight.value, [0, 1, 2], [0, -44, -height * 0.62]) + bob },
        { translateX: buzz },
        { rotate: `${(float.value - 0.5) * 2.4 + interpolate(flight.value, [0, 1, 2], [0, -3, 6])}deg` },
        { scale: interpolate(flight.value, [0, 1, 2], [1, 1.14, 2.5]) },
      ],
    };
  });

  const still = useAnimatedStyle(() => ({ opacity: 1 - spin.value }));
  const spinning = useAnimatedStyle(() => ({ opacity: spin.value }));

  const floor = useAnimatedStyle(() => ({
    opacity: interpolate(flight.value, [0, 1, 1.4], [1, 0.35, 0], Extrapolation.CLAMP),
    transform: [{ scaleX: interpolate(flight.value, [0, 1], [1, 0.55], Extrapolation.CLAMP) - (float.value - 0.5) * 0.06 }, { scaleY: interpolate(flight.value, [0, 1], [1, 0.6], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={[styles.wrap, { width: cardWidth }]}>
      <Animated.View style={[styles.card, card]}>
        <View style={styles.ghostClip}>
          <Text style={styles.ghost} numberOfLines={1}>
            FALCO
          </Text>
        </View>
      </Animated.View>

      <View style={[styles.stage, { height: droneHeight + 62 }]} pointerEvents="none">
        <Animated.View style={[styles.floor, { width: droneWidth * 0.8, top: 30 + droneHeight * 0.83 }, floor]}>
          <Svg width="100%" height={46} viewBox="0 0 100 46" preserveAspectRatio="none">
            <Defs>
              <RadialGradient id="floor" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0" stopColor="#0A0B0D" stopOpacity={0.42} />
                <Stop offset="0.55" stopColor="#0A0B0D" stopOpacity={0.14} />
                <Stop offset="1" stopColor="#0A0B0D" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={50} cy={23} rx={50} ry={23} fill="url(#floor)" />
          </Svg>
        </Animated.View>
        <Animated.View style={[{ width: droneWidth, height: droneHeight }, drone]}>
          <Animated.View style={[StyleSheet.absoluteFill, still]}>
            <Image source={require("@/assets/img/drone.png")} style={styles.fill} resizeMode="contain" />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, spinning]}>
            <Image source={require("@/assets/img/drone-spin.png")} style={styles.fill} resizeMode="contain" />
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.body, card]}>
        <Text style={styles.title}>READY TO FLY</Text>
        <Text style={styles.note}>All systems clear for {DRONE.minutes} minutes.</Text>
        <View style={styles.slider}>
          <LaunchSlider armed={armed} auto={auto} onLaunch={onLaunch} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignSelf: "center" },
  card: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.card, borderRadius: radius.xl, ...shadow.card },
  ghostClip: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: radius.xl, overflow: "hidden", alignItems: "center" },
  ghost: { fontFamily: fonts.black, fontSize: 118, letterSpacing: -5, color: "#F0F1F4", marginTop: 2 },
  stage: { alignItems: "center", justifyContent: "flex-start", paddingTop: 30 },
  floor: { position: "absolute", alignSelf: "center" },
  fill: { width: "100%", height: "100%" },
  body: { paddingHorizontal: 20, paddingBottom: 18, backgroundColor: "transparent" },
  title: { fontFamily: fonts.black, fontSize: 24, letterSpacing: -0.6, color: colors.ink },
  note: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted, marginTop: 4 },
  slider: { marginTop: 16 },
});
