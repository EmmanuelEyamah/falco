import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { IMAGES, type CaptureItem } from "@/constants/data";

interface ShotProps {
  item: Pick<CaptureItem, "image" | "focus">;
  style?: StyleProp<ViewStyle>;
}

/** A capture, framed on the part of the photograph the item points at. */
export const Shot = ({ item, style }: ShotProps) => (
  <View style={[styles.clip, style]}>
    <Image
      source={IMAGES[item.image]}
      resizeMode="cover"
      style={[styles.image, { transform: [{ scale: item.focus.scale }, { translateX: `${item.focus.x * 100}%` }, { translateY: `${item.focus.y * 100}%` }] }]}
    />
  </View>
);

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  image: { width: "100%", height: "100%" },
});
