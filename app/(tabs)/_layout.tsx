import { Tabs } from "expo-router";
import { TabBar } from "@/components/TabBar";
import { colors } from "@/utils/theme";

const TabLayout = () => (
  <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, animation: "shift", sceneStyle: { backgroundColor: colors.bg } }}>
    <Tabs.Screen name="home" />
    <Tabs.Screen name="gallery" />
    <Tabs.Screen name="capture" />
    <Tabs.Screen name="profile" />
  </Tabs>
);

export default TabLayout;
