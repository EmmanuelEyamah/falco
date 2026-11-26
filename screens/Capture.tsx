import { Aperture, Grid3x3, ShieldCheck, Sparkles } from "lucide-react-native";
import { useEffect, useState, type ComponentType } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Rise } from "@/components/Rise";
import { Chips } from "@/components/ui/Chips";
import { Panel } from "@/components/ui/Panel";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { ScreenTitle } from "@/components/ui/ScreenTitle";
import { Segmented } from "@/components/ui/Segmented";
import { Toggle } from "@/components/ui/Toggle";
import { IMAGES } from "@/constants/data";
import { useShown } from "@/hooks/useShown";
import { colors, fonts, radius, shadow } from "@/utils/theme";

const MODES = ["Photo", "Video", "Slow-mo", "Timelapse", "Pano"] as const;
const RESOLUTIONS = ["4K", "2.7K", "1080p"] as const;
const RATES = ["24", "30", "60", "120"] as const;
const ISO_STOPS = [100, 200, 400, 800, 1600, 3200, 6400];

type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface SwitchRowProps {
  Icon: IconType;
  title: string;
  note: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}
const SwitchRow = ({ Icon, title, note, value, onChange, last = false }: SwitchRowProps) => (
  <View style={[styles.row, !last && styles.rowRule]}>
    <View style={styles.rowIcon}>
      <Icon size={18} color={colors.ink} strokeWidth={2.2} />
    </View>
    <View style={styles.rowWords}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowNote}>{note}</Text>
    </View>
    <Toggle value={value} onChange={onChange} />
  </View>
);

export const Capture = () => {
  const insets = useSafeAreaInsets();
  const shown = useShown();
  const [mode, setMode] = useState<(typeof MODES)[number]>("Photo");
  const [resolution, setResolution] = useState<(typeof RESOLUTIONS)[number]>("4K");
  const [rate, setRate] = useState<(typeof RATES)[number]>("60");
  const [exposure, setExposure] = useState(0.5);
  const [iso, setIso] = useState(0);
  const [hdr, setHdr] = useState(true);
  const [grid, setGrid] = useState(true);
  const [sensing, setSensing] = useState(true);
  const [raw, setRaw] = useState(false);

  const ev = (exposure - 0.5) * 4;
  const isoValue = ISO_STOPS[Math.round(iso * (ISO_STOPS.length - 1))];

  const light = useSharedValue(0);
  const lines = useSharedValue(1);
  const focus = useSharedValue(0);
  const swap = useSharedValue(1);

  useEffect(() => {
    light.value = withTiming(ev, { duration: 120 });
  }, [ev, light]);
  useEffect(() => {
    lines.value = withTiming(grid ? 1 : 0, { duration: 260 });
  }, [grid, lines]);
  useEffect(() => {
    focus.value = withRepeat(withSequence(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.quad) })), -1);
  }, [focus]);
  useEffect(() => {
    swap.value = 0.6;
    swap.value = withSpring(1, { damping: 11, stiffness: 200 });
  }, [mode, resolution, rate, swap]);

  const bright = useAnimatedStyle(() => ({ opacity: Math.max(0, light.value) * 0.32 }));
  const dark = useAnimatedStyle(() => ({ opacity: Math.max(0, -light.value) * 0.36 }));
  const gridStyle = useAnimatedStyle(() => ({ opacity: lines.value * 0.55 }));
  const ring = useAnimatedStyle(() => ({ opacity: 0.6 + focus.value * 0.4, transform: [{ scale: 1 + focus.value * 0.08 }] }));
  const tag = useAnimatedStyle(() => ({ transform: [{ scale: swap.value }] }));

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 130 }}>
        <Rise show={shown} delay={0}>
          <ScreenTitle eyebrow="CAMERA SETUP" title="Capture" />
        </Rise>

        <Rise show={shown} delay={90} style={styles.preview}>
          <Image source={IMAGES.coast} style={styles.fill} resizeMode="cover" />
          <Animated.View style={[styles.wash, { backgroundColor: colors.white }, bright]} pointerEvents="none" />
          <Animated.View style={[styles.wash, { backgroundColor: "#000" }, dark]} pointerEvents="none" />
          <Animated.View style={[styles.wash, gridStyle]} pointerEvents="none">
            <View style={[styles.line, styles.v, { left: "33.33%" }]} />
            <View style={[styles.line, styles.v, { left: "66.66%" }]} />
            <View style={[styles.line, styles.h, { top: "33.33%" }]} />
            <View style={[styles.line, styles.h, { top: "66.66%" }]} />
          </Animated.View>
          <Animated.View style={[styles.focus, ring]} pointerEvents="none" />
          <View style={styles.previewTop}>
            <Animated.View style={[styles.tag, tag]}>
              <Text style={styles.tagText}>
                {mode.toUpperCase()} · {resolution} · {rate}
              </Text>
            </Animated.View>
            {hdr && (
              <View style={[styles.tag, styles.tagAccent]}>
                <Text style={styles.tagText}>HDR</Text>
              </View>
            )}
          </View>
          <View style={styles.previewBottom}>
            <Text style={styles.readout}>
              {ev >= 0 ? "+" : ""}
              {ev.toFixed(1)} EV
            </Text>
            <Text style={styles.readout}>ISO {isoValue}</Text>
            <Text style={styles.readout}>f/2.8</Text>
          </View>
        </Rise>

        <Rise show={shown} delay={170} style={styles.chips}>
          <Chips items={MODES} value={mode} onChange={setMode} />
        </Rise>

        <Rise show={shown} delay={240} style={styles.gap}>
          <Panel label="RESOLUTION" value={resolution}>
            <Segmented items={RESOLUTIONS} value={resolution} onChange={setResolution} />
            <View style={styles.spacer} />
            <View style={styles.subHead}>
              <Text style={styles.subLabel}>FRAME RATE</Text>
              <Text style={styles.subValue}>{rate} fps</Text>
            </View>
            <Segmented items={RATES} value={rate} onChange={setRate} />
          </Panel>
        </Rise>

        <Rise show={shown} delay={310} style={styles.gap}>
          <Panel label="EXPOSURE" value={`${ev >= 0 ? "+" : ""}${ev.toFixed(1)} EV`}>
            <RangeSlider value={exposure} onChange={setExposure} />
            <View style={styles.spacer} />
            <View style={styles.subHead}>
              <Text style={styles.subLabel}>ISO</Text>
              <Text style={styles.subValue}>{isoValue}</Text>
            </View>
            <RangeSlider value={iso} onChange={setIso} />
          </Panel>
        </Rise>

        <Rise show={shown} delay={380} style={styles.gap}>
          <Panel style={styles.list}>
            <SwitchRow Icon={Sparkles} title="HDR" note="Blend three exposures" value={hdr} onChange={setHdr} />
            <SwitchRow Icon={Grid3x3} title="Grid lines" note="Rule of thirds overlay" value={grid} onChange={setGrid} />
            <SwitchRow Icon={ShieldCheck} title="Obstacle sensing" note="Brake before anything in the way" value={sensing} onChange={setSensing} />
            <SwitchRow Icon={Aperture} title="RAW + JPEG" note="Keep the full sensor data" value={raw} onChange={setRaw} last />
          </Panel>
        </Rise>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  fill: { width: "100%", height: "100%" },
  preview: { height: 250, marginHorizontal: 16, marginTop: 16, borderRadius: radius.xl, overflow: "hidden", backgroundColor: colors.inkSoft, ...shadow.card },
  wash: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  line: { position: "absolute", backgroundColor: "rgba(255,255,255,0.9)" },
  v: { top: 0, bottom: 0, width: StyleSheet.hairlineWidth * 2 },
  h: { left: 0, right: 0, height: StyleSheet.hairlineWidth * 2 },
  focus: { position: "absolute", alignSelf: "center", top: 89, width: 72, height: 72, borderRadius: 14, borderWidth: 2, borderColor: colors.accent },
  previewTop: { position: "absolute", left: 12, right: 12, top: 12, flexDirection: "row", justifyContent: "space-between" },
  tag: { height: 28, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "rgba(10,11,13,0.5)", justifyContent: "center" },
  tagAccent: { backgroundColor: colors.accent },
  tagText: { fontFamily: fonts.monoBold, fontSize: 10, letterSpacing: 1.2, color: colors.white },
  previewBottom: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", justifyContent: "space-around", paddingVertical: 11, backgroundColor: "rgba(10,11,13,0.46)" },
  readout: { fontFamily: fonts.monoBold, fontSize: 12, color: colors.white },
  chips: { marginTop: 10 },
  gap: { marginTop: 12 },
  spacer: { height: 18 },
  subHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 },
  subLabel: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 2, color: colors.muted },
  subValue: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.ink },
  list: { paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 13 },
  rowRule: { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: colors.line },
  rowIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  rowWords: { flex: 1, marginLeft: 12 },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.ink },
  rowNote: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
});
