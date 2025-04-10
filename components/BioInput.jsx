import { StyleSheet, TextInput, View } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";

const BioInput = (props) => {
  return (
    <View style={[styles.container, props.containerStyles]}>
      <TextInput
        style={[styles.input, props.style]}
        placeholderTextColor={theme.colors.textLight}
        multiline={true}
        textAlignVertical="top"
        {...props}
      />
    </View>
  );
};

export default BioInput;

const styles = StyleSheet.create({
  container: {
    height: hp(20), // Aumentamos la altura
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    paddingHorizontal: 18,
    paddingVertical: 15, // Asegura que el texto no esté pegado arriba
  },
  input: {
    flex: 1,
    fontSize: hp(2),
    color: theme.colors.text,
  },
});
