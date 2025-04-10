// components/PostCard.jsx
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "../constants/theme";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import TresPuntosHorizontal from "../assets/icons/TresPuntosHorizontal";
import RenderHTML from "react-native-render-html";
import { Image } from "expo-image";
import { downloadFile, getSupabaseFileUrl } from "../services/imageService";
import { Video } from "expo-av";
import Heart2 from "../assets/icons/Heart2";
import Comentarios from "../assets/icons/Comentarios";
import Compartir from "../assets/icons/Compartir";
import { createPostLike, removePostLike } from "../services/postService";
import Loading from "./Loading";
import Edit from "../assets/icons/Edit";
import Eliminar from "../assets/icons/Eliminar";
import { supabase } from "../lib/supabase";

const textStyle = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
};

const tagStyles = {
  div: textStyle,
  p: textStyle,
  ol: textStyle,
  h1: { color: theme.colors.dark },
  h4: { color: theme.colors.dark },
};

const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  showMoreIcon = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
}) => {
  // Definimos estilos de sombra
  const shadowStyles = {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };

  const [likes, setLikes] = useState(item?.postLikes || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Actualizamos likes cada vez que cambian
    setLikes(item?.postLikes || []);
  }, [item?.postLikes]);

  useEffect(() => {
    const commentsChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload) => {
          if (
            payload.new.postId === item.id ||
            payload.old.postId === item.id
          ) {
            // Si es un nuevo comentario
            if (payload.eventType === "INSERT") {
              setCommentsCount((prevCount) => prevCount + 1);
            }
            // Si se eliminó un comentario
            else if (payload.eventType === "DELETE") {
              setCommentsCount((prevCount) => prevCount - 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
    };
  }, [item.id]);

  // Función para navegar a los detalles del post
  const openPostDetails = () => {
    if (!showMoreIcon) return;
    router.push({ pathname: "postDetails", params: { postId: item?.id } });
  };

  // Función para dar o quitar like
  const onLike = async () => {
    const alreadyLiked = likes.some((like) => like.userId === currentUser?.id);
    if (alreadyLiked) {
      const res = await removePostLike(item?.id, currentUser?.id);
      if (res.success) {
        setLikes(likes.filter((like) => like.userId !== currentUser?.id));
      } else {
        Alert.alert("Publicación", "No se pudo quitar el like");
      }
    } else {
      const res = await createPostLike({
        userId: currentUser?.id,
        postId: item?.id,
      });
      if (res.success) {
        setLikes([...likes, res.data]);
      } else {
        Alert.alert("Publicación", "No se pudo dar like");
      }
    }
  };

  const handlePostDelete = () => {
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

  // Función para compartir el post
  const onShare = async () => {
    let content = { message: stripHtmlTags(item?.body) };
    if (item?.file) {
      setLoading(true);
      const fileUrlObj = getSupabaseFileUrl(item?.file);
      let url = fileUrlObj?.uri ? await downloadFile(fileUrlObj.uri) : null;
      setLoading(false);
      content.url = url;
    }
    try {
      await Share.share(content);
    } catch (error) {
      Alert.alert("Error", "No se pudo compartir la publicación");
    }
  };

  const createdAt = moment(item?.created_at).format("MMMM D");
  const liked = likes.some((like) => like.userId === currentUser?.id);

  // Calculamos el contador de comentarios. Se toma en cuenta si se usa agregación o se trae el arreglo completo.
  const [commentCount, setCommentsCount] = useState(
    item?.commentsCount ||
      (item?.comments?.length > 0 ? item.comments.length : 0)
  );
  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      {showMoreIcon && (
        <TouchableOpacity onPress={openPostDetails} style={styles.threeDots}>
          <TresPuntosHorizontal />
        </TouchableOpacity>
      )}

      <View style={styles.userInfo}>
        <View style={styles.leftInfo}>
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.posTime}>{createdAt}</Text>
          </View>
        </View>
        {showDelete && currentUser.id == item?.userId && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Edit></Edit>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Eliminar></Eliminar>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.body && (
            <RenderHTML
              contentWidth={wp(100)}
              source={{ html: item?.body }}
              tagsStyles={tagStyles}
              defaultKeyPrefix={`post_${item?.id}_render`}
            />
          )}
        </View>
        {item?.file && item?.file.includes("postImages") && (
          <Image
            source={getSupabaseFileUrl(item?.file)}
            transition={100}
            style={styles.postMedia}
            contentFit="cover"
          />
        )}
        {item?.file && item?.file.includes("postVideos") && (
          <Video
            style={[styles.postMedia, { height: hp(30) }]}
            source={getSupabaseFileUrl(item?.file)}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Heart2 liked={liked} />
          </TouchableOpacity>
          <Text style={styles.count}>{likes.length}</Text>
        </View>

        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Comentarios />
          </TouchableOpacity>
          <Text style={styles.count}>{commentCount}</Text>
        </View>

        <View style={styles.footerButton}>
          {loading ? (
            <Loading size="small" />
          ) : (
            <TouchableOpacity onPress={onShare}>
              <Compartir />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: "continuous",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  threeDots: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: hp(1.4),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  posTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: { gap: 10 },
  postMedia: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
});
