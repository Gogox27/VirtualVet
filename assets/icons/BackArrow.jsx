import { View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const BackArrow = (props) => {
  return (
    <Ionicons
      name="arrow-back-circle-outline"
      size={26}
      strokeWidth={2.5}
      color={theme.colors.text}
    />
  );
};

export default BackArrow;
