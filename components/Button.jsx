import { Pressable, StyleSheet, Text, ActivityIndicator } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";

const Button = ({ title = "", onPress = () => {}, loading = false }) => {
  return (
    <Pressable
      style={[styles.button, loading && styles.buttonLoading]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.xl,
    width: "100%", // Botón ancho
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLoading: {
    backgroundColor: "transparent", // Hace que el fondo desaparezca al cargar
  },
  buttonText: {
    color: "white",
    fontSize: hp(2),
    fontWeight: "bold",
  },
});
