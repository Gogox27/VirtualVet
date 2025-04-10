import { View, Text } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { theme } from "../../constants/theme";

const Eliminar = () => {
  return <AntDesign name="delete" size={25} color={theme.colors.rose} />;
};

export default Eliminar;
