import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../src/theme";

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", color: focused ? colors.ink : colors.muted }}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line, height: 64 },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen name="today" options={{ title: "Today", tabBarLabel: ({ focused }) => <TabLabel label="Today" focused={focused} /> }} />
      <Tabs.Screen name="jobs" options={{ title: "Jobs", tabBarLabel: ({ focused }) => <TabLabel label="Jobs" focused={focused} /> }} />
      <Tabs.Screen name="camera" options={{ title: "Camera", tabBarLabel: ({ focused }) => <TabLabel label="Camera" focused={focused} /> }} />
      <Tabs.Screen name="messages" options={{ title: "Text", tabBarLabel: ({ focused }) => <TabLabel label="Text" focused={focused} /> }} />
    </Tabs>
  );
}
