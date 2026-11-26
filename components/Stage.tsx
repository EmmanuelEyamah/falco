import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Onboarding } from "@/components/Onboarding";
import { Splash } from "@/components/Splash";
import { router } from "expo-router";
import { AUTOPILOT, AUTOPILOT_PULL, AUTOPILOT_TOUR } from "@/constants/data";
import { useFlightControl } from "@/hooks/useFlightControl";
import { Flight } from "@/screens/Flight";
import { useFlightStore } from "@/stores/useFlightStore";
import { colors } from "@/utils/theme";

interface StageProps {
  children: ReactNode;
}

/** The tabs sit at the bottom of the stack; the flight view, onboarding and splash are layered over them. */
export const Stage = ({ children }: StageProps) => {
  const phase = useFlightStore((s) => s.phase);
  const setPhase = useFlightStore((s) => s.setPhase);
  const { land } = useFlightControl();
  const played = useRef(false);
  const arrived = phase === "home";
  const dark = phase === "flying" || phase === "onboarding";

  const reveal = useCallback(() => setPhase("onboarding"), [setPhase]);
  const enter = useCallback(() => setPhase("home"), [setPhase]);

  useEffect(() => {
    if (!AUTOPILOT || !arrived || played.current) return;
    played.current = true;
    if (AUTOPILOT_TOUR) {
      setTimeout(() => router.navigate("/gallery"), 1500);
      setTimeout(() => router.navigate("/capture"), 5000);
      setTimeout(() => router.navigate("/profile"), 8500);
      setTimeout(() => router.navigate("/home"), 12000);
      return;
    }
    if (AUTOPILOT_PULL) return;
    const { setMission, cue } = useFlightStore.getState();
    setTimeout(() => setMission("orbit"), 2600);
    setTimeout(() => setMission("track"), 3900);
    setTimeout(() => cue("autoLaunch"), 5200);
    setTimeout(() => cue("autoCapture"), 12800);
    setTimeout(land, 16500);
  }, [arrived, land]);

  return (
    <View style={styles.stage}>
      <StatusBar style={dark ? "light" : "dark"} animated />
      {children}
      <Flight onLand={land} />
      {phase !== "splash" && <Onboarding onDone={enter} />}
      <Splash onReveal={reveal} />
    </View>
  );
};

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: colors.bg },
});
