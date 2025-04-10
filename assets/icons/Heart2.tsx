import { View, Text } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { theme } from "../../constants/theme";

const Heart2 = ({ liked }: { liked: boolean }) => {
  return (
    <AntDesign
      name={liked ? "heart" : "hearto"}
      size={24}
      color={liked ? theme.colors.rose : theme.colors.textLight}
      fill={liked ? theme.colors.rose : "transparent"}
    />
  );
};

export default Heart2;
