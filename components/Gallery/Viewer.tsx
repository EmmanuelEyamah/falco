import { Download, Share2, Trash2, X } from "lucide-react-native";
import { useEffect, type ComponentType } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shot } from "@/components/Gallery/Shot";
import { Press } from "@/components/ui/Press";
import type { CaptureItem } from "@/constants/data";
import { colors, fonts, radius } from "@/utils/theme";

const META = ["ISO 100", "f/2.8", "1/800", "24 mm"];
const ACTIONS: { key: string; Icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
  { key: "share", Icon: Share2 },
  { key: "save", Icon: Download },
  { key: "delete", Icon: Trash2 },
];

interface ViewerProps {
  item: CaptureItem | null;
  onClose: () => void;
}

/** Full-screen look at one capture: the frame swells in, the details slide up under it. */
export const Viewer = ({ item, onClose }: ViewerProps) => {
  const insets = useSafeAreaInsets();
  const open = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    if (item) {
      open.value = 0;
      open.value = withSpring(1, { damping: 17, stiffness: 150 });
      drift.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) }), -1, true);
    }
  }, [item, open, drift]);

  const close = () => {
    open.value = withTiming(0, { duration: 200 });
    setTimeout(onClose, 190);
  };

  const backdrop = useAnimatedStyle(() => ({ opacity: Math.min(1, open.value * 1.2) }));
  const frame = useAnimatedStyle(() => ({ opacity: Math.min(1, open.value * 1.5), transform: [{ scale: 0.82 + open.value * 0.18 }, { translateY: (1 - open.value) * 40 }] }));
  const zoom = useAnimatedStyle(() => ({ transform: [{ scale: 1.04 + drift.value * 0.08 }] }));
  const panel = useAnimatedStyle(() => ({ opacity: open.value, transform: [{ translateY: (1 - open.value) * 60 }] }));

  return (
    <Modal visible={!!item} transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <Animated.View style={[styles.backdrop, backdrop]} />
      {item && (
        <View style={[styles.wrap, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.bar}>
            <Text style={styles.count}>{item.kind === "video" ? "VIDEO" : "PHOTO"} · 4K</Text>
            <Pressable onPress={close} hitSlop={12} style={styles.close}>
              <X size={20} color={colors.white} strokeWidth={2.6} />
            </Pressable>
          </View>
          <Animated.View style={[styles.frame, frame]}>
            <Animated.View style={[styles.fill, zoom]}>
              <Shot item={item} style={styles.fill} />
            </Animated.View>
          </Animated.View>
          <Animated.View style={panel}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.place}>{item.place} · 118 m altitude</Text>
            <View style={styles.meta}>
              {META.map((m) => (
                <View key={m} style={styles.chip}>
                  <Text style={styles.chipText}>{m}</Text>
                </View>
              ))}
            </View>
            <View style={styles.actions}>
              {ACTIONS.map(({ key, Icon }) => (
                <Press key={key} style={[styles.action, key === "share" && styles.primary]}>
                  <Icon size={20} color={key === "share" ? colors.ink : colors.white} strokeWidth={2.2} />
                  {key === "share" && <Text style={styles.primaryText}>Share</Text>}
                </Press>
              ))}
            </View>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "#07080A" },
  wrap: { flex: 1, paddingHorizontal: 18 },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 44 },
  count: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2.4, color: "rgba(255,255,255,0.6)" },
  close: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  frame: { flex: 1, borderRadius: radius.xl, overflow: "hidden", marginTop: 12, marginBottom: 22, backgroundColor: colors.inkSoft },
  fill: { width: "100%", height: "100%" },
  title: { fontFamily: fonts.semibold, fontSize: 30, letterSpacing: -1.1, color: colors.white },
  place: { fontFamily: fonts.regular, fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 6 },
  meta: { flexDirection: "row", gap: 8, marginTop: 18 },
  chip: { height: 32, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", justifyContent: "center" },
  chipText: { fontFamily: fonts.mono, fontSize: 11, color: "rgba(255,255,255,0.85)" },
  actions: { flexDirection: "row", gap: 10, marginTop: 22 },
  action: { height: 58, minWidth: 58, borderRadius: 29, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9 },
  primary: { backgroundColor: colors.white, paddingHorizontal: 30, flexGrow: 1 },
  primaryText: { fontFamily: fonts.semibold, fontSize: 15.5, color: colors.ink },
});
