import { LinearGradient } from "expo-linear-gradient";
import { Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaptureCard } from "@/components/Gallery/CaptureCard";
import { Viewer } from "@/components/Gallery/Viewer";
import { Rise } from "@/components/Rise";
import { Chips } from "@/components/ui/Chips";
import { Press } from "@/components/ui/Press";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { CAPTURES, GALLERY_FILTERS, IMAGES, type CaptureItem } from "@/constants/data";
import { useShown } from "@/hooks/useShown";
import { useFlightStore } from "@/stores/useFlightStore";
import { colors, fonts, radius, shadow } from "@/utils/theme";

type Filter = (typeof GALLERY_FILTERS)[number];

export const Gallery = () => {
  const insets = useSafeAreaInsets();
  const shown = useShown();
  const shots = useFlightStore((s) => s.shots);
  const [filter, setFilter] = useState<Filter>("See all");
  const [favourites, setFavourites] = useState<string[]>(() => CAPTURES.filter((c) => c.favourite).map((c) => c.id));
  const [open, setOpen] = useState<CaptureItem | null>(null);
  const scrollY = useSharedValue(0);

  // During a sync the cards step out, then deal themselves back in.
  const [syncing, setSyncing] = useState(false);
  const dealt = shown && !syncing;

  // Photographs taken in the flight view land at the front of the roll.
  const all = useMemo<CaptureItem[]>(() => {
    const fresh = Array.from({ length: shots }, (_, i): CaptureItem => ({ id: `flight-${shots - i}`, title: `Flight capture ${shots - i}`, place: "Just now", kind: "photo", image: "valley", focus: { scale: 1.5, x: 0, y: -0.1 } }));
    return [...fresh, ...CAPTURES];
  }, [shots]);

  const items = all.filter((c) => (filter === "Photos" ? c.kind === "photo" : filter === "Videos" ? c.kind === "video" : filter === "Favourites" ? favourites.includes(c.id) : true));
  const columns = [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];

  const toggle = (id: string) => setFavourites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const hero = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [-200, 0, 300], [0, 0, 90], Extrapolation.CLAMP) }, { scale: interpolate(scrollY.value, [-200, 0], [1.24, 1.12], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={styles.screen}>
      <PullToRefresh onRefresh={() => setSyncing(true)} onSettled={() => setSyncing(false)} scrollY={scrollY} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 130 }}>
        <Rise show={shown} delay={0} style={styles.hero}>
          <Animated.View style={[styles.fill, hero]}>
            <Image source={IMAGES.valley} style={styles.fill} resizeMode="cover" />
          </Animated.View>
          <LinearGradient colors={["rgba(6,8,12,0)", "rgba(6,8,12,0.82)"]} style={styles.shade} pointerEvents="none" />
          <View style={styles.count}>
            <Text style={styles.countText}>{all.length} CAPTURES</Text>
          </View>
          <View style={styles.heroRow}>
            <View style={styles.heroWords}>
              <Text style={styles.heroTitle}>GALLERY</Text>
              <Text style={styles.heroNote}>All your captured moments in one place.</Text>
            </View>
            <Press style={styles.search}>
              <Search size={20} color={colors.white} strokeWidth={2.4} />
            </Press>
          </View>
        </Rise>

        <Rise show={shown} delay={110} style={styles.chips}>
          <Chips items={GALLERY_FILTERS} value={filter} onChange={setFilter} />
        </Rise>

        <Rise show={shown} delay={190} style={styles.heading}>
          <Text style={styles.title}>RECENT CAPTURES</Text>
          <Text style={styles.aside}>{items.length} shown</Text>
        </Rise>

        {items.length === 0 ? (
          <Rise show={shown} delay={240} style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyNote}>Tap the heart on a capture to keep it in this list.</Text>
          </Rise>
        ) : (
          <View style={styles.grid}>
            {columns.map((column, c) => (
              <View key={c} style={styles.column}>
                {column.map((item, i) => (
                  <Rise key={`${filter}-${item.id}`} show={dealt} delay={(syncing ? 0 : 240) + (i * 2 + c) * 70}>
                    <CaptureCard item={item} favourite={favourites.includes(item.id)} tall={(i + c) % 2 === 0} onOpen={setOpen} onFavourite={toggle} />
                  </Rise>
                ))}
              </View>
            ))}
          </View>
        )}
      </PullToRefresh>
      <Viewer item={open} onClose={() => setOpen(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  fill: { width: "100%", height: "100%" },
  hero: { height: 268, marginHorizontal: 16, borderRadius: radius.xl, overflow: "hidden", backgroundColor: colors.inkSoft, ...shadow.card },
  shade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 170 },
  count: { position: "absolute", left: 14, top: 14, height: 28, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "rgba(10,11,13,0.42)", justifyContent: "center" },
  countText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.6, color: colors.white },
  heroRow: { position: "absolute", left: 18, right: 14, bottom: 16, flexDirection: "row", alignItems: "flex-end" },
  heroWords: { flex: 1 },
  heroTitle: { fontFamily: fonts.black, fontSize: 28, letterSpacing: -0.8, color: colors.white },
  heroNote: { fontFamily: fonts.regular, fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 3 },
  search: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  chips: { marginTop: 12 },
  heading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 14, marginHorizontal: 20 },
  title: { fontFamily: fonts.black, fontSize: 15.5, letterSpacing: 0.2, color: colors.ink },
  aside: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.muted },
  grid: { flexDirection: "row", gap: 12, marginTop: 12, marginHorizontal: 16 },
  column: { flex: 1, gap: 12 },
  empty: { marginTop: 36, alignItems: "center", paddingHorizontal: 40 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  emptyNote: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted, textAlign: "center", marginTop: 6, lineHeight: 20 },
});
