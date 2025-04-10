import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createComment,
  fetchPostsDetails,
  removeComment,
  removePost,
} from "../../services/postService";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading";
import PostCard from "../../components/PostCard";
import Input from "../../components/Input";
import Enviar from "../../assets/icons/Enviar";
import CommentItem from "../../components/CommentItem";
import { getUserData } from "../../services/userServices";
import { supabase } from "../../lib/supabase";
import { createNotification } from "../../services/notificationService";

const PostDetails = () => {
  const { postId, commentId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [startLoading, setStarLoading] = useState(true);
  const inputRef = useRef(null);
  const commentRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState(null);

  const handleNewComment = async (payload) => {
    if (payload.new) {
      let newComment = { ...payload.new };
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
      setPost((prevPost) => ({
        ...prevPost,
        comments: [newComment, ...prevPost.comments],
        commentsCount: (prevPost.commentsCount || 0) + 1,
      }));
    }
  };

  useEffect(() => {
    const commentChannel = supabase
      .channel(`post-${postId}-comments`)
      .on(
        "postgres_changes",
        {
          event: "*", // Capturar todos los eventos: INSERT, UPDATE, DELETE
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postId}`,
        },
        (payload) => {
          // Si es un nuevo comentario de otro usuario
          if (
            payload.eventType === "INSERT" &&
            payload.new.userId !== user.id
          ) {
            handleNewComment(payload);
          }
          // Si se elimina un comentario
          else if (payload.eventType === "DELETE") {
            setPost((prevPost) => {
              const updatedComments = prevPost.comments.filter(
                (c) => c.id !== payload.old.id
              );
              return {
                ...prevPost,
                comments: updatedComments,
                commentsCount: updatedComments.length,
              };
            });
          }
        }
      )
      .subscribe();

    getPostDetails();

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, []);

  const getPostDetails = async () => {
    let res = await fetchPostsDetails(postId);
    if (res.succes) {
      setPost(res.data);
    }
    setStarLoading(false);
  };

  const onNewComment = async () => {
    if (!commentRef.current || commentRef.current.trim() === "") {
      return;
    }

    const commentText = commentRef.current.trim();
    const data = {
      userId: user?.id,
      postId: post?.id,
      text: commentText,
    };

    setLoading(true);
    let res = await createComment(data);
    setLoading(false);

    if (res.success) {
      // Crear un nuevo comentario localmente para actualizarlo inmediatamente
      const newComment = {
        ...res.data,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      };

      // Actualizar el estado local con el nuevo comentario
      setPost((prevPost) => ({
        ...prevPost,
        comments: [newComment, ...(prevPost.comments || [])],
        commentsCount: (prevPost.commentsCount || 0) + 1,
      }));

      // Enviar notificación si corresponde
      if (user.id !== post.userId) {
        const notify = {
          senderId: user.id,
          receiverId: post.userId,
          title: "Nuevo comentario en tu publicación",
          data: JSON.stringify({ postId: post.id, commentId: res?.data?.id }),
        };

        createNotification(notify);

        if (!notificationResponse.success) {
          Alert.alert("Error", "No se pudo crear la notificación.");
        }
      }

      // Limpiar el campo de comentario
      inputRef.current?.clear();
      commentRef.current = "";
    } else {
      Alert.alert("Comentario", res.msg);
    }
  };

  const onDeleteComment = async (comment) => {
    let res = await removeComment(comment?.id);
    if (res.success) {
      setPost((prevPost) => {
        let updatePost = { ...prevPost };
        updatePost.comments = updatePost.comments.filter(
          (c) => c.id !== comment.id
        );
        updatePost.commentsCount = (updatePost.commentsCount || 1) - 1;
        return updatePost;
      });
    } else {
      Alert.alert("Comentario", res.msg);
    }
  };

  const onDeletePost = async (item) => {
    let res = await removePost(post.id);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Publicación", res.msg);
    }
  };

  const onEditPost = async (item) => {
    router.back();
    router.push({ pathname: "newPost", params: { ...item } });
  };

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (!post) {
    return (
      <View
        style={[
          styles.center,
          { justifyContent: "flex-start", marginTop: 100 },
        ]}
      >
        <Text style={styles.notFound}>Post no Encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <PostCard
          item={post}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMoreIcon={false}
          showDelete={true}
          onDelete={onDeletePost}
          onEdit={onEditPost}
        />

        <View style={styles.inputContainer}>
          <Input
            inputRef={inputRef}
            placeholder="Escribe un comentario..."
            onChangeText={(value) => (commentRef.current = value)}
            placeholderTextColor={theme.colors.textLight}
            containerStyles={{
              flex: 1,
              height: hp(6.2),
              borderRadius: theme.radius.xl,
            }}
          />
          {loading ? (
            <View style={styles.loading}>
              <Loading size="small" />
            </View>
          ) : (
            <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
              <Enviar />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginVertical: 15, gap: 17 }}>
          {post?.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <CommentItem
                key={comment?.id?.toString()}
                item={comment}
                onDelete={onDeleteComment}
                highlight={comment.id == commentId}
                canDelete={
                  user.id === comment.userId || user.id === post.userId
                }
              />
            ))
          ) : (
            <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
              Sé el primero en comentar
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: wp(7),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    paddingHorizontal: wp(4),
  },
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.3 }],
  },
});
