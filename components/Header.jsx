import { View, Text, StyleSheet } from "react-native";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";

const Header = ({ title, leftComponent = null, rightComponent = null }) => {
  return (
    <View style={styles.container}>
      <View style={styles.side}>{leftComponent}</View>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {title || ""}
      </Text>
      <View style={styles.side}>{rightComponent}</View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: hp(7),
  },
  title: {
    fontSize: hp(3),
    fontWeight: "bold",
    color: theme.colors.textDark,
    textAlign: "center",
    flex: 1,
  },
  side: {
    width: wp(12),
    alignItems: "center",
  },
});
