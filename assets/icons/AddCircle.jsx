import { View, Text } from "react-native";
import React from "react";
import { hp } from "../../helpers/common";
import { Ionicons } from "@expo/vector-icons";

const AddCircle = (props) => {
  return <Ionicons name="add-circle-outline" size={hp(3.2)} color="black" />;
};

export default AddCircle;
