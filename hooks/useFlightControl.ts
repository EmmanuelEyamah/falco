import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import {
  Easing,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useFlightStore } from "@/stores/useFlightStore";
import { flight, spin } from "@/utils/flightMotion";

const SPIN_UP = 420;
const LIFT = 900;
const FLY = 880;

/** Take-off and landing: the timing of the whole sequence lives here. */
export const useFlightControl = () => {
  const setPhase = useFlightStore((s) => s.setPhase);

  const launch = useCallback(() => {
    setPhase("launching");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    spin.value = withTiming(1, {
      duration: SPIN_UP + 200,
      easing: Easing.in(Easing.quad),
    });
    flight.value = withDelay(
      SPIN_UP,
      withSequence(
        withTiming(1, { duration: LIFT, easing: Easing.out(Easing.cubic) }),
        withTiming(2, { duration: FLY, easing: Easing.in(Easing.cubic) }),
      ),
    );
    setTimeout(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
      SPIN_UP + LIFT,
    );
    setTimeout(() => setPhase("flying"), SPIN_UP + LIFT + FLY - 120);
  }, [setPhase]);

  const land = useCallback(() => {
    setPhase("landing");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    flight.value = withTiming(0, {
      duration: 1300,
      easing: Easing.out(Easing.cubic),
    });
    spin.value = withDelay(1150, withTiming(0, { duration: 700 }));
    setTimeout(() => setPhase("home"), 1350);
  }, [setPhase]);

  return { launch, land };
};
