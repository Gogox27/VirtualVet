// app/(main)/home.jsx
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Heart from "../../assets/icons/Heart";
import AddCircle from "../../assets/icons/AddCircle";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { getUserData } from "../../services/userServices";

const PAGE_SIZE = 7;

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handlePostEvents = async (payload) => {
    if (payload.eventType === "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPosts((prevPost) => [newPost, ...prevPost]);
    }
    if (payload.eventType == "DELETE" && payload.old.id) {
      setPosts((prevPost) =>
        prevPost.filter((posts) => posts.id !== payload.old.id)
      );
    }
    if (payload.eventType === "UPDATE" && payload?.new?.id) {
      setPosts((prevPost) =>
        prevPost.map((post) =>
          post.id === payload.new.id
            ? { ...post, body: payload.new.body, file: payload.new.file }
            : post
        )
      );
    }
  };

  const fetchInitialPosts = async () => {
    const from = 0;
    const to = PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("posts")
      .select("*, user:userId(*), postLikes(*)")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (!error) {
      setPosts(data);
      setPage(1);
      setHasMore(data.length === PAGE_SIZE);
    }
  };

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("posts")
      .select("*, user:userId(*), postLikes(*)")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (!error && data?.length) {
      setPosts((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [loadingMore, hasMore, page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    await fetchInitialPosts();
    setRefreshing(false);
  };

  const handleNewNotification = async (payload) => {
    // Verifica si `user` está definido antes de usarlo
    if (!user || !user.id) return;

    // Verifica que `payload` y `payload.new` no sean undefined
    if (payload?.eventType === "INSERT" && payload?.new?.id) {
      if (payload.new.userId === user.id) {
        setNotificationCount((prev) => prev + 1);
      }
    }
    console.log("tienes una notificacion", payload);
  };

  useEffect(() => {
    if (!user) return; // Si el usuario no está disponible, no subscribirse a los canales

    const commentsChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload) => {
          if (payload?.eventType === "INSERT") {
            setPosts((prevPosts) =>
              prevPosts.map((post) =>
                post.id === payload.new.postId
                  ? { ...post, comments: [...post.comments, payload.new] }
                  : post
              )
            );
            // Increment notification count for the current user
            if (payload?.new?.userId !== user.id) {
              setNotificationCount((prevCount) => prevCount + 1);
            }
          } else if (payload?.eventType === "DELETE") {
            setPosts((prevPosts) =>
              prevPosts.map((post) =>
                post.id === payload.old.postId
                  ? {
                      ...post,
                      comments: post.comments.filter(
                        (comment) => comment.id !== payload.old.id
                      ),
                    }
                  : post
              )
            );
          }
        }
      )
      .subscribe();

    const postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        handlePostEvents
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        handleNewNotification
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []); // Dependencia de user

  return (
    <ScreenWrapper bg="white">
      <View style={styles.header}>
        <Text style={styles.title}>VirtualVet</Text>
        <View style={styles.icons}>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              setNotificationCount(0);
              router.push("/notifications");
            }}
          >
            {notificationCount > 0 && (
              <View style={styles.pill}>
                <Text style={styles.pillText}>{notificationCount}</Text>
              </View>
            )}
            <Heart />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push("newPost")}
          >
            <AddCircle />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push("perfilazo")}
          >
            <Avatar
              uri={user?.image}
              size={hp(4.3)}
              rounded={theme.radius.sm}
              style={{ borderWidth: 2 }}
            />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard item={item} currentUser={user} router={router} />
        )}
        contentContainerStyle={styles.listStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ marginVertical: 30 }}>
              <Loading size="small" color={theme.colors.primary} />
            </View>
          ) : !hasMore ? (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPost}>No hay más posts</Text>
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: hp(1),
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPost: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },
  pillText: {
    color: "white",
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
});
