import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Play } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { Shot } from "@/components/Gallery/Shot";
import { Press } from "@/components/ui/Press";
import type { CaptureItem } from "@/constants/data";
import { colors, fonts, radius, shadow } from "@/utils/theme";

interface CaptureCardProps {
  item: CaptureItem;
  favourite: boolean;
  tall?: boolean;
  onOpen: (item: CaptureItem) => void;
  onFavourite: (id: string) => void;
}

export const CaptureCard = ({ item, favourite, tall = false, onOpen, onFavourite }: CaptureCardProps) => {
  const pop = useSharedValue(1);
  const heart = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <Press onPress={() => onOpen(item)} depth={0.96} style={[styles.card, { height: tall ? 236 : 188 }]}>
      <Shot item={item} style={styles.fill} />
      <LinearGradient colors={["rgba(6,8,12,0)", "rgba(6,8,12,0.78)"]} style={styles.shade} pointerEvents="none" />
      <View style={styles.top}>
        <Pressable
          hitSlop={10}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            pop.value = withSequence(withTiming(1.5, { duration: 110 }), withSpring(1, { damping: 6, stiffness: 260 }));
            onFavourite(item.id);
          }}
        >
          <Animated.View style={[styles.round, heart]}>
            <Heart size={15} color={favourite ? colors.accent : colors.white} fill={favourite ? colors.accent : "transparent"} strokeWidth={2.4} />
          </Animated.View>
        </Pressable>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>4K</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <View style={styles.words}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.place} numberOfLines={1}>
            {item.kind === "video" ? `${item.length} · ` : ""}
            {item.place}
          </Text>
        </View>
        {item.kind === "video" && (
          <View style={styles.play}>
            <Play size={13} color={colors.ink} fill={colors.ink} />
          </View>
        )}
      </View>
    </Press>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.inkSoft, ...shadow.card },
  fill: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  shade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 120 },
  top: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  round: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(10,11,13,0.38)", alignItems: "center", justifyContent: "center" },
  badge: { height: 24, paddingHorizontal: 9, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.24)", justifyContent: "center" },
  badgeText: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.white, letterSpacing: 0.6 },
  bottom: { position: "absolute", left: 12, right: 10, bottom: 11, flexDirection: "row", alignItems: "flex-end" },
  words: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.white, letterSpacing: -0.2 },
  place: { fontFamily: fonts.regular, fontSize: 11, color: "rgba(255,255,255,0.72)", marginTop: 2 },
  play: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", paddingLeft: 2 },
});
