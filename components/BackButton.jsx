import { Pressable, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import BackArrow from "../assets/icons/BackArrow";
import { theme } from "../constants/theme";

const BackButton = () => {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} style={styles.button}>
      <BackArrow />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
});
