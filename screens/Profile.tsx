import { Bell, ChevronRight, Download, Ruler, Settings2, ShieldCheck } from "lucide-react-native";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WeekChart } from "@/components/Profile/WeekChart";
import { Rise } from "@/components/Rise";
import { Panel } from "@/components/ui/Panel";
import { Press } from "@/components/ui/Press";
import { ScreenTitle } from "@/components/ui/ScreenTitle";
import { Toggle } from "@/components/ui/Toggle";
import { DRONE, PILOT } from "@/constants/data";
import { useCountUp } from "@/hooks/useCountUp";
import { useShown } from "@/hooks/useShown";
import { colors, fonts, radius, shadow } from "@/utils/theme";

type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface StatProps {
  label: string;
  value: number;
  unit: string;
  show: boolean;
  delay: number;
}
const Stat = ({ label, value, unit, show, delay }: StatProps) => {
  const shownValue = useCountUp(show ? value : 0, 1200, delay);
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {Math.round(shownValue)}
        <Text style={styles.statUnit}> {unit}</Text>
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

interface RowProps {
  Icon: IconType;
  title: string;
  right: ReactNode;
  last?: boolean;
}
const Row = ({ Icon, title, right, last = false }: RowProps) => (
  <View style={[styles.row, !last && styles.rowRule]}>
    <View style={styles.rowIcon}>
      <Icon size={18} color={colors.ink} strokeWidth={2.2} />
    </View>
    <Text style={styles.rowTitle}>{title}</Text>
    {right}
  </View>
);

const Go = ({ value }: { value?: string }) => (
  <View style={styles.go}>
    {value && <Text style={styles.goText}>{value}</Text>}
    <ChevronRight size={18} color={colors.faint} strokeWidth={2.4} />
  </View>
);

export const Profile = () => {
  const insets = useSafeAreaInsets();
  const shown = useShown();
  const [alerts, setAlerts] = useState(true);
  const level = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    level.value = shown ? withDelay(300, withTiming(PILOT.progress, { duration: 1100, easing: Easing.out(Easing.cubic) })) : 0;
  }, [shown, level]);
  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [float]);

  const bar = useAnimatedStyle(() => ({ width: `${level.value * 100}%` }));
  const craft = useAnimatedStyle(() => ({ transform: [{ translateY: (float.value - 0.5) * 10 }, { rotate: `${(float.value - 0.5) * 3}deg` }] }));

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 130 }}>
        <Rise show={shown} delay={0}>
          <ScreenTitle
            eyebrow="PILOT"
            title="Profile"
            right={
              <Press style={styles.gear}>
                <Settings2 size={20} color={colors.ink} strokeWidth={2.2} />
              </Press>
            }
          />
        </Rise>

        <Rise show={shown} delay={90} style={styles.gap}>
          <Panel>
            <View style={styles.who}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{PILOT.initials}</Text>
              </View>
              <View style={styles.whoWords}>
                <Text style={styles.name}>{PILOT.name}</Text>
                <Text style={styles.role}>Certified pilot · Level {PILOT.level}</Text>
              </View>
            </View>
            <View style={styles.levelHead}>
              <Text style={styles.small}>LEVEL {PILOT.level}</Text>
              <Text style={styles.small}>{Math.round(PILOT.progress * 100)}% TO LEVEL {PILOT.level + 1}</Text>
            </View>
            <View style={styles.rail}>
              <Animated.View style={[styles.railFill, bar]} />
            </View>
            <View style={styles.stats}>
              <Stat label="Flights" value={PILOT.flights} unit="" show={shown} delay={200} />
              <View style={styles.rule} />
              <Stat label="Air time" value={PILOT.hours} unit="h" show={shown} delay={300} />
              <View style={styles.rule} />
              <Stat label="Distance" value={PILOT.distance} unit="km" show={shown} delay={400} />
            </View>
          </Panel>
        </Rise>

        <Rise show={shown} delay={180} style={styles.gap}>
          <WeekChart show={shown} />
        </Rise>

        <Rise show={shown} delay={270} style={[styles.gap, styles.fleet]}>
          <View style={styles.fleetWords}>
            <Text style={styles.fleetLabel}>MY FLEET</Text>
            <Text style={styles.fleetName}>{DRONE.name}</Text>
            <View style={styles.health}>
              <View style={styles.healthDot} />
              <Text style={styles.healthText}>Healthy · v2.4.1</Text>
            </View>
            <Text style={styles.fleetNote}>{DRONE.battery}% charged · 38 cycles</Text>
          </View>
          <Animated.View style={[styles.craft, craft]}>
            <Image source={require("@/assets/img/drone.png")} style={styles.fill} resizeMode="contain" />
          </Animated.View>
        </Rise>

        <Rise show={shown} delay={360} style={styles.gap}>
          <Panel style={styles.list}>
            <Row Icon={Ruler} title="Units" right={<Go value="Metric" />} />
            <Row Icon={ShieldCheck} title="Safety and geofence" right={<Go />} />
            <Row Icon={Bell} title="Flight alerts" right={<Toggle value={alerts} onChange={setAlerts} />} />
            <Row
              Icon={Download}
              title="Firmware update"
              last
              right={
                <View style={styles.new}>
                  <Text style={styles.newText}>NEW</Text>
                </View>
              }
            />
          </Panel>
        </Rise>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  fill: { width: "100%", height: "100%" },
  gap: { marginTop: 14 },
  gear: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", ...shadow.card },
  who: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.accent },
  initials: { fontFamily: fonts.bold, fontSize: 19, color: colors.white, letterSpacing: 0.5 },
  whoWords: { marginLeft: 14, flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 19, letterSpacing: -0.4, color: colors.ink },
  role: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 3 },
  levelHead: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  small: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.6, color: colors.muted },
  rail: { height: 8, borderRadius: 4, backgroundColor: colors.bg, marginTop: 8, overflow: "hidden" },
  railFill: { height: 8, borderRadius: 4, backgroundColor: colors.ink },
  stats: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  stat: { flex: 1, alignItems: "center" },
  rule: { width: StyleSheet.hairlineWidth * 2, height: 32, backgroundColor: colors.line },
  statValue: { fontFamily: fonts.monoBold, fontSize: 22, color: colors.ink, letterSpacing: -0.5 },
  statUnit: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, letterSpacing: 0 },
  statLabel: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.muted, marginTop: 3 },
  fleet: { marginHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.ink, padding: 18, height: 156, overflow: "hidden", ...shadow.lift, shadowOpacity: 0.2 },
  fleetWords: { width: "54%" },
  fleetLabel: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 2, color: "rgba(255,255,255,0.5)" },
  fleetName: { fontFamily: fonts.black, fontSize: 24, letterSpacing: -0.8, color: colors.white, marginTop: 6 },
  health: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  healthDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.good, marginRight: 7 },
  healthText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.white },
  fleetNote: { fontFamily: fonts.regular, fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 5 },
  craft: { position: "absolute", right: -46, top: 28, width: 250, height: 102 },
  list: { paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 13 },
  rowRule: { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: colors.line },
  rowIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  rowTitle: { flex: 1, marginLeft: 12, fontFamily: fonts.semibold, fontSize: 14.5, color: colors.ink },
  go: { flexDirection: "row", alignItems: "center", gap: 4 },
  goText: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  new: { height: 24, paddingHorizontal: 10, borderRadius: 12, backgroundColor: colors.accent, justifyContent: "center" },
  newText: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.white, letterSpacing: 1 },
});
