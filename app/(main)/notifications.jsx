import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchNotifications } from "../../services/notificationService";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import ScreenWrapper from "../../components/ScreenWrapper";
import { router, useRouter } from "expo-router";
import NotificationItem from "../../components/NotificationItem";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    let res = await fetchNotifications(user.id);
    if (res.succes) {
      setNotifications(res.data);
    }
  };
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header leftComponent={<BackButton />} title="Notificaciones" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
        >
          {notifications.map((item) => {
            return (
              <NotificationItem
                item={item}
                key={item?.id}
                router={router}
              ></NotificationItem>
            );
          })}
          {notifications.length == 0 && (
            <Text style={styles.noData}>No hay notificaciones aún</Text>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: "center",
  },
});
