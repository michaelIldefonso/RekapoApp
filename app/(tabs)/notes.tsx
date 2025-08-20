import { StyleSheet, Text, View } from "react-native";

export default function NotesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📒 Notes Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 20, fontWeight: "600" },
});
