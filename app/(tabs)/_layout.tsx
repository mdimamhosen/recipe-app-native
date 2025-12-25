import React from "react";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constant/colors";

const Layout = () => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor:  COLORS.textLight,
        tabBarStyle: { paddingBottom: 5, height: 60, backgroundColor: COLORS.background ,
        borderTopColor: COLORS.border,
          
         },
        headerShown: false,
        tabBarLabelStyle: { fontSize: 12,
          fontWeight: '600'
         },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
     <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="favorite"
        options={{
          title: "Favorite",
          headerShown: false,
          tabBarLabel: "Favorite",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      /> */}
    </Tabs>
  );
};

export default Layout;
