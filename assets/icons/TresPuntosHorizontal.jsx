import { View, Text } from "react-native";
import React from "react";
import { hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Entypo from "@expo/vector-icons/Entypo";

const TresPuntosHorizontal = () => {
  return (
    <Entypo
      name="dots-three-horizontal"
      size={hp(3)}
      color={theme.colors.text}
      strokeWidth={3}
    />
  );
};

export default TresPuntosHorizontal;
