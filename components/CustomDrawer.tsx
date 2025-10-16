import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";

export default function CustomDrawer(props: any) {
  const navigation = useNavigation();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Header with Logo + Profile */}
      <View style={styles.header}>
        {/* Profile Pic (tap → Settings) */}
        <TouchableOpacity
          style={styles.profileWrapper}
          onPress={() => navigation.navigate("Settings" as never)}
        >
          <Image
            source={require("../assets/images/profile.png")} // fallback default profile
            style={styles.profilePic}
          />
          <View>
            <Text style={styles.name}>Agent Name</Text>
            <Text style={styles.email}>agent@email.com</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Drawer Items */}
      <View style={{ flex: 1, paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: "#3B82F6",
  },
  profileWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  email: {
    color: "#e0e0e0",
    fontSize: 12,
  },
});
