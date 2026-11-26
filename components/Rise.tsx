import { useEffect, type ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";

interface RiseProps {
  show: boolean;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** Entrance used across the app: a block fades in and settles upward on a spring. */
export const Rise = ({ show, delay = 0, distance = 26, style, children }: RiseProps) => {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = show ? withDelay(delay, withSpring(1, { damping: 16, stiffness: 140, mass: 0.9 })) : withTiming(0, { duration: 180 });
  }, [show, delay, t]);

  const animated = useAnimatedStyle(() => ({
    opacity: Math.min(1, t.value * 1.4),
    transform: [{ translateY: (1 - t.value) * distance }, { scale: 0.96 + t.value * 0.04 }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
};
