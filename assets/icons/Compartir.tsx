import { View, Text } from "react-native";
import React from "react";
import Entypo from "@expo/vector-icons/Entypo";
import { theme } from "../../constants/theme";

const Share = () => {
  return (
    <Entypo name="share-alternative" size={24} color={theme.colors.textLight} />
  );
};

export default Share;
