import { View, Text } from "react-native";
import React from "react";
import { theme } from "../../constants/theme";
import Entypo from "@expo/vector-icons/Entypo";

const Email = (props) => {
  return <Entypo name="email" size={18} color={theme.colors.darkLight} />;
};

export default Email;
