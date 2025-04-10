import { View, Text } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const Logout = (props) => {
  return (
    <MaterialIcons
      name="logout"
      size={26}
      color={theme.colors.rose}
      strokeWidth={2.5}
    />
  );
};

export default Logout;
