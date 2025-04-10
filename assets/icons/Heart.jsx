import { View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { hp } from "../../helpers/common";

const Heart = (props) => {
  return (
    <Ionicons
      name="heart-outline"
      size={hp(3.2)}
      color="black"
      strokeWidht={2}
    />
  );
};

export default Heart;
