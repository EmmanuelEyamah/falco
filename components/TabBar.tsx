import * as Haptics from "expo-haptics";
import type { Tabs } from "expo-router";
import { Camera, House, Images, User } from "lucide-react-native";
import { useEffect, type ComponentProps, type ComponentType } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoMark } from "@/components/LogoMark";
import { useFlightStore } from "@/stores/useFlightStore";
import { flight } from "@/utils/flightMotion";
import { colors, fonts, shadow } from "@/utils/theme";

/** Props expo-router passes to a custom `tabBar`. */
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];
type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const TABS: Record<string, { label: string; Icon: IconType }> = {
  home: { label: "Home", Icon: House },
  gallery: { label: "Gallery", Icon: Images },
  capture: { label: "Capture", Icon: Camera },
  profile: { label: "Profile", Icon: User },
};

interface TabItemProps {
  label: string;
  Icon: IconType;
  active: boolean;
  onPress: () => void;
}

const TabItem = ({ label, Icon, active, onPress }: TabItemProps) => {
  const press = useSharedValue(1);
  const on = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    on.value = withSpring(active ? 1 : 0, { damping: 14, stiffness: 180 });
  }, [active, on]);

  const lift = useAnimatedStyle(() => ({ transform: [{ scale: press.value }, { translateY: -on.value * 3 }] }));
  const dim = useAnimatedStyle(() => ({ opacity: 1 - on.value }));
  const lit = useAnimatedStyle(() => ({ opacity: on.value }));
  const text = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.faint, colors.ink]) }));
  const dot = useAnimatedStyle(() => ({ opacity: on.value, transform: [{ scale: on.value }] }));

  return (
    <Pressable
      style={styles.item}
      onPressIn={() => (press.value = withSpring(0.84, { damping: 14, stiffness: 320 }))}
      onPressOut={() => (press.value = withSpring(1, { damping: 9, stiffness: 260 }))}
      onPress={onPress}
    >
      <Animated.View style={[styles.itemInner, lift]}>
        <View style={styles.iconBox}>
          <Animated.View style={[styles.iconLayer, dim]}>
            <Icon size={22} color={colors.faint} strokeWidth={2} />
          </Animated.View>
          <Animated.View style={[styles.iconLayer, lit]}>
            <Icon size={22} color={colors.ink} strokeWidth={2.4} />
          </Animated.View>
        </View>
        <Animated.Text style={[styles.label, text]}>{label}</Animated.Text>
        <Animated.View style={[styles.dot, dot]} />
      </Animated.View>
    </Pressable>
  );
};

export const TabBar = ({ state, navigation }: TabBarProps) => {
  const insets = useSafeAreaInsets();
  const phase = useFlightStore((s) => s.phase);
  const press = useSharedValue(1);
  const enter = useSharedValue(0);
  const ready = phase !== "splash" && phase !== "onboarding";

  useEffect(() => {
    enter.value = ready ? withTiming(1, { duration: 700 }) : 0;
  }, [ready, enter]);

  const bar = useAnimatedStyle(() => ({
    opacity: enter.value * interpolate(flight.value, [0, 0.7], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: (1 - enter.value) * 70 + interpolate(flight.value, [0, 0.9], [0, 120], Extrapolation.CLAMP) }],
  }));
  const hub = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  const go = (name: string) => {
    Haptics.selectionAsync();
    navigation.navigate(name);
  };

  const items = state.routes.map((route, index) => {
    const tab = TABS[route.name];
    if (!tab) return null;
    return <TabItem key={route.key} label={tab.label} Icon={tab.Icon} active={state.index === index} onPress={() => go(route.name)} />;
  });

  return (
    <Animated.View style={[styles.bar, { bottom: Math.max(insets.bottom, 14) }, bar]} pointerEvents={phase === "home" ? "auto" : "none"}>
      {items.slice(0, 2)}
      <Pressable
        onPressIn={() => (press.value = withSpring(0.9, { damping: 14, stiffness: 320 }))}
        onPressOut={() => (press.value = withSpring(1, { damping: 8, stiffness: 240 }))}
        onPress={() => go("home")}
      >
        <Animated.View style={[styles.hub, hub]}>
          <LogoMark size={26} color={colors.white} />
        </Animated.View>
      </Pressable>
      {items.slice(2)}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bar: { position: "absolute", left: 16, right: 16, height: 76, borderRadius: 38, backgroundColor: colors.card, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, ...shadow.card, shadowOpacity: 0.14 },
  item: { flex: 1, height: 76, alignItems: "center", justifyContent: "center" },
  itemInner: { alignItems: "center" },
  iconBox: { width: 24, height: 24 },
  iconLayer: { position: "absolute", left: 1, top: 1 },
  label: { fontFamily: fonts.semibold, fontSize: 10.5, marginTop: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: 3 },
  hub: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", marginTop: -22, borderWidth: 5, borderColor: colors.bg, ...shadow.lift },
});
