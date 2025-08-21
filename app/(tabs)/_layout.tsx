import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
//hehe sorry late
export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔝 Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => console.log("Menu pressed")}>
          <Feather name="menu" size={28} />
        </TouchableOpacity>

        {/* ✅ Custom Logo */}
        <View style={styles.brandWrap}>
          <Image source={require("C:\\Users\\SCAVINDIZH\\Documents\\GitHub\\RekapoApp\\assets\\images\\rekapo logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>REKAPO.AI</Text>
        </View>
      </View>

      {/* ⚡ Bottom Tabs */}
      <Tabs
        screenOptions={{
    headerShown: false,
    tabBarStyle: {
      borderTopWidth: 0.5,
      borderTopColor: "#ccc",
      height: 90,
      paddingBottom: 15,
    },
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
      marginBottom: 30,
      textTransform: "capitalize", // Makes first letter uppercase
    },
  }}
      >
        <Tabs.Screen
    name="notes"
    options={{
      tabBarLabel: "Notes",
            tabBarIcon: ({ color, size }) => <Feather name="file-text" size={size + 6} color={color} />,
          }}
        />

        <Tabs.Screen
    name="record"
    options={{
      tabBarLabel: "Start Taking Notes",
            tabBarIcon: () => (
              <View style={styles.recordOuter}>
                <View style={styles.recordInner} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
    name="upload"
    options={{
      tabBarLabel: "Upload Recorded",
            tabBarIcon: ({ color, size }) => <Feather name="upload" size={size + 6} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const GREEN = "#45B800";

const styles = StyleSheet.create({
  topBar: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, // ✅ push below status bar
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8, // ✅ balanced top/bottom padding
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logo: {
    width: 28,
    height: 28,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
  },
  recordOuter: {
    height: 35,
    width: 35,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  recordInner: {
    height: 28,
    width: 28,
    borderRadius: 28,
    backgroundColor: GREEN,
  },
});
