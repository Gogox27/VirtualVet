import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { router, useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
import Logout from "../../assets/icons/Logout";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { supabase } from "../../lib/supabase";
import Avatar from "../../components/Avatar";
import Edit from "../../assets/icons/Edit";
import Mail from "../../assets/icons/Mail";
import Email from "../../assets/icons/Email";
import Phone from "../../assets/icons/Phone";
import { fetchPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";

var limit = 0;

const Perfilazo = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false); // Para mostrar el indicador de carga

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Cerrar sesión", "¡Error al cerrar sesión!");
    }
  };

  const getPosts = async () => {
    if (!hasMore || loading) return; // Evitar solicitudes múltiples mientras se cargan los datos
    setLoading(true); // Activar indicador de carga

    limit += 4;
    let res = await fetchPosts(limit, user.id); // Asegúrate de que `fetchPosts` esté filtrando por el `user.id`
    if (res.succes) {
      setPosts((prevPosts) => [...prevPosts, ...res.data]); // Concatenar los nuevos posts con los anteriores
      setHasMore(res.data.length === 4); // Si recibimos 4 posts, hay más
    }

    setLoading(false); // Desactivar indicador de carga
  };

  const handleLogout = async () => {
    Alert.alert("Confirmar", "¿Estás seguro de cerrar sesión?", [
      {
        text: "Cancelar",
        onPress: () => console.log("Modal Cancelled"),
        style: "cancel",
      },
      {
        text: "Cerrar Sesión",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenWrapper bg={"white"}>
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader user={user} handleLogout={handleLogout} />
        }
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard item={item} currentUser={user} router={router} />
        )}
        onEndReached={getPosts}
        onEndReachedThreshold={0.1} // Ajusté el umbral para la carga de más posts
        ListFooterComponent={
          loading ? (
            <View style={{ marginVertical: posts.length === 0 ? 100 : 30 }}>
              <Loading />
            </View>
          ) : !hasMore ? (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>No hay más posts</Text>
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
  );
};

const UserHeader = ({ user, handleLogout }) => {
  return (
    <View style={styles.container}>
      <Header
        leftComponent={<BackButton />}
        title={"Perfil"}
        rightComponent={<LogoutButton onPress={handleLogout} />}
      />
      <View style={{ gap: 15 }}>
        <View style={styles.avatarContainer}>
          <Avatar
            uri={user?.image}
            size={hp(12)}
            rounded={theme.radius.xxl * 1.4}
          />
          <Pressable
            style={styles.editIcon}
            onPress={() => router.push("edirProfile")}
          >
            <Edit />
          </Pressable>
        </View>
        <View style={{ alignItems: "center", gap: 4 }}>
          <Text style={styles.userName}>{user && user.name}</Text>
          <Text style={styles.infoText1}>{user && user.address}</Text>
        </View>
        <View style={{ gap: 10 }}>
          <View style={styles.info}>
            <Email />
            <Text style={styles.infoText2}>{user && user.email}</Text>
          </View>
          {user && user.phoneNumber && (
            <View style={styles.info}>
              <Phone />
              <Text style={styles.infoText2}>{user && user.phoneNumber}</Text>
            </View>
          )}
          {user && user.bio && (
            <View style={styles.info}>
              <Text style={styles.bioContainer}>{user.bio}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const LogoutButton = ({ onPress }) => (
  <TouchableOpacity style={styles.logoutButton} onPress={onPress}>
    <Logout />
  </TouchableOpacity>
);

export default Perfilazo;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: wp(4) },
  headerContainer: {
    marginHorizontal: wp(4),
    marginBottom: 20,
  },
  headerShape: {
    width: wp(100),
    height: hp(20),
  },
  bioContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: wp(4),
    paddingRight: wp(4),
    paddingVertical: hp(1),
    borderWidth: 0.4,
    borderColor: theme.colors.textLight,
    borderRadius: theme.radius.xxl,
    backgroundColor: "#f9f9f9",
    minHeight: hp(7),
    width: "100%",
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
    paddingTop: hp(1),
    paddingBottom: hp(1),
  },
  editIcon: {
    paddingTop: hp(1),
    position: "absolute",
    bottom: -15,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    paddingTop: hp(1),
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  info: {
    paddingTop: hp(1),
    flexDirection: "row",
    alignItems: "center",
    color: theme.colors.textDark,
  },
  infoText1: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  infoText2: {
    paddingLeft: wp(2),
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  logoutButton: {
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.textDark,
  },
});
