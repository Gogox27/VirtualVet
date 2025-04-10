import { View, Text } from "react-native";
import React from "react";
import Feather from "@expo/vector-icons/Feather";
import { theme } from "../../constants/theme";

const Phone = () => {
  return <Feather name="phone" size={18} color={theme.colors.darkLight} />;
};

export default Phone;
