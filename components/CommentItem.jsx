import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { hp } from "../helpers/common";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import moment from "moment";
import Eliminar from "../assets/icons/Eliminar";

const CommentItem = ({
  item,
  canDelete = false,
  onDelete = () => {},
  highlight = true,
}) => {
  const createdAt = moment(item?.created_at).format("MMMM D");
  const handleDelete = () => {
    Alert.alert("Confirmar", "¿Estás Seguro que quieres eliminarlo?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        onPress: () => onDelete(item),
        style: "destructive",
      },
    ]);
  };
  return (
    <View style={styles.container}>
      <Avatar uri={item?.user?.image} size={hp(4)} rounded={theme.radius.md} />
      <View style={[styles.content, highlight && styles.hIGHLIGHT]}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.text}>{item?.user?.name}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={[styles.text, { color: theme.colors.textLight }]}>
              {createdAt}
            </Text>
          </View>
          {canDelete && (
            <TouchableOpacity onPress={handleDelete}>
              <Eliminar />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.text, { fontWeight: "normal" }]}>
          {item?.text}
        </Text>
      </View>
    </View>
  );
};

export default CommentItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    borderCurve: "continuous",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
  },
  dot: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginHorizontal: 2,
  },
  hIGHLIGHT: {
    borderWidth: 0.2,
    backgroundColor: "white",
    borderColor: theme.colors.dark,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
