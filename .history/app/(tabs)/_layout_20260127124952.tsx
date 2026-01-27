import { Tabs } from "expo-router";
import { User } from "lucide-react-native";
import React from "react";

import { Colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.green,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Profile Screen",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
