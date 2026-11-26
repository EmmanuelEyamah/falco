import { useIsFocused } from "expo-router";
import { useFlightStore } from "@/stores/useFlightStore";

/** True once the app is past its intro and this tab is the one on screen: screens use it to replay their entrance. */
export const useShown = () => {
  const focused = useIsFocused();
  const phase = useFlightStore((s) => s.phase);
  return focused && phase !== "splash" && phase !== "onboarding";
};
