import { View, Text } from "react-native";
import React from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { theme } from "../../constants/theme";

const Comentarios = () => {
  return (
    <FontAwesome5 name="comments" size={24} color={theme.colors.textLight} />
  );
};

export default Comentarios;
