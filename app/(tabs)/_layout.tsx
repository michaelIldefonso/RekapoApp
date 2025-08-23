import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Image, Platform, StatusBar } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* Top Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 10,
          backgroundColor: "white",
        }}
      >
        {/* Search Button */}
        <TouchableOpacity>
          <Ionicons name="search" size={28} color="black" />
        </TouchableOpacity>

        {/* Spacer to push logo to right */}
        <View style={{ flex: 1 }} />

        {/* Logo Image on Top Right */}
        <Image
          source={require("C:\\Users\\SCAVINDIZH\\Documents\\GitHub\\RekapoApp\\assets\\images\\fulllogowithname.png")} // Update path to your logo image
          style={{ width: 120, height: 40, resizeMode: "contain" }}
        />
      </View>

      {/* Empty Space (main content area) */}
      <View style={{ flex: 1 }} />

      {/* Bottom Navigation */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 32, paddingVertical: 12, borderTopWidth: 1, borderColor: "#e5e5e5" }}>
        {/* Notes Button */}
        <TouchableOpacity style={{ alignItems: "center" }}>
          <MaterialIcons name="notes" size={28} color="black" />
          <Text style={{ fontSize: 12 }}>Notes</Text>
        </TouchableOpacity>

        {/* Record Button */}
        <TouchableOpacity>
          <View style={{ backgroundColor: "black", padding: 18, borderRadius: 50 }}>
            <FontAwesome name="microphone" size={28} color="white" />
          </View>
          <Text style={{ textAlign: "center", fontSize: 12, marginTop: 4 }}></Text>
        </TouchableOpacity>

        {/* Account Button */}
        <TouchableOpacity style={{ alignItems: "center" }}>
          <Ionicons name="person-outline" size={28} color="black" />
          <Text style={{ fontSize: 12 }}>Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}