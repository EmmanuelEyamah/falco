import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/utils/theme";

interface ScreenTitleProps {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}

export const ScreenTitle = ({ eyebrow, title, right }: ScreenTitleProps) => (
  <View style={styles.row}>
    <View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
    {right}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 20 },
  eyebrow: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 2.4, color: colors.muted },
  title: { fontFamily: fonts.black, fontSize: 32, letterSpacing: -1.2, color: colors.ink, marginTop: 4 },
});
