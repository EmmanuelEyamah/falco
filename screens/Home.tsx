import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Home/Header";
import { HeroCard } from "@/components/Home/HeroCard";
import { MissionCard } from "@/components/Home/MissionCard";
import { StatsRow } from "@/components/Home/StatsRow";
import { Rise } from "@/components/Rise";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { MISSIONS } from "@/constants/data";
import { useFlightControl } from "@/hooks/useFlightControl";
import { useShown } from "@/hooks/useShown";
import { useFlightStore } from "@/stores/useFlightStore";
import { flight } from "@/utils/flightMotion";
import { colors, fonts } from "@/utils/theme";

// Everything except the drone clears the screen as it lifts off: `direction` says which way a block leaves.
const useClear = (direction: number) =>
  useAnimatedStyle(() => ({
    opacity: interpolate(flight.value, [0, 0.75], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          flight.value,
          [0, 0.9],
          [0, direction * 46],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

export const Home = () => {
  const insets = useSafeAreaInsets();
  const phase = useFlightStore((s) => s.phase);
  const mission = useFlightStore((s) => s.mission);
  const setMission = useFlightStore((s) => s.setMission);
  const autoLaunch = useFlightStore((s) => s.autoLaunch);
  const { launch } = useFlightControl();
  const shown = useShown();
  // While a sync runs the readings drop to zero, then climb back: it reads as fresh data arriving.
  const [syncing, setSyncing] = useState(false);
  const live = shown && !syncing;

  const up = useClear(-1);
  const down = useClear(1);
  const further = useClear(1.8);

  return (
    <View style={styles.screen}>
      <PullToRefresh
        onRefresh={() => setSyncing(true)}
        onSettled={() => setSyncing(false)}
        scrollEnabled={phase === "home"}
        contentContainerStyle={{
          paddingTop: insets.top + 6,
          paddingBottom: 130,
        }}
      >
        <Animated.View style={up}>
          <Rise show={shown} delay={0}>
            <Header live={live} />
          </Rise>
        </Animated.View>

        <Rise show={shown} delay={90} style={styles.hero}>
          <HeroCard
            armed={phase === "home"}
            auto={autoLaunch}
            onLaunch={launch}
          />
        </Rise>

        <Animated.View style={down}>
          <Rise show={shown} delay={190} style={styles.block}>
            <StatsRow live={live} />
          </Rise>
        </Animated.View>

        <Animated.View style={further}>
          <Rise show={shown} delay={280} style={styles.heading}>
            <Text style={styles.title}>QUICK AI MISSIONS</Text>
            <Text style={styles.aside}>One-tap</Text>
          </Rise>
          <View style={styles.grid}>
            {MISSIONS.map((m, i) => (
              <Rise
                key={m.id}
                show={shown}
                delay={340 + i * 70}
                style={styles.slot}
              >
                <MissionCard
                  mission={m}
                  selected={mission === m.id}
                  onSelect={setMission}
                />
              </Rise>
            ))}
          </View>
        </Animated.View>
      </PullToRefresh>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { marginTop: 14, zIndex: 5 },
  block: { marginTop: 12 },
  heading: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 22,
    marginHorizontal: 20,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 15.5,
    letterSpacing: 0.2,
    color: colors.ink,
  },
  aside: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.muted },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginTop: 12,
    marginHorizontal: 16,
  },
  slot: { width: "48.3%" },
});
