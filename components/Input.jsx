import { StyleSheet, TextInput, View } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";

const Input = (props) => {
  return (
    <View
      style={[styles.container, props.containerStyles && props.containerStyles]}
    >
      {props.icon && <View style={styles.iconContainer}>{props.icon}</View>}
      <TextInput
        style={[styles.input, props.style]}
        placeholderTextColor={theme.colors.textLight}
        ref={props.inputRef && props.inputRef}
        {...props}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: hp(7.2),
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    paddingHorizontal: 18,
    gap: 12,
  },
  iconContainer: {
    paddingRight: wp(1),
  },
  input: {
    flex: 1,
    fontSize: hp(2),
    paddingVertical: hp(1),
    color: theme.colors.text,
  },
});
