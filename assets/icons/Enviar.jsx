import { View, Text } from "react-native";
import React from "react";
import Feather from "@expo/vector-icons/Feather";
import { theme } from "../../constants/theme";

const Enviar = () => {
  return <Feather name="send" size={24} color={theme.colors.primaryDark} />;
};

export default Enviar;
