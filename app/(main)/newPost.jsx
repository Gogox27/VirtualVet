import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Avatar from "../../components/Avatar";
import { useAuth } from "../../contexts/AuthContext";
import RichTextEditor from "../../components/RichTextEditor";
import { useLocalSearchParams, useRouter } from "expo-router";
import Imagen from "../../assets/icons/Imagen";
import Videos from "../../assets/icons/Videos";
import Button from "../../components/Button";
import { Image } from "expo-image";
import { getSupabaseFileUrl } from "../../services/imageService";
import Eliminar from "../../assets/icons/Eliminar";
import { Video } from "expo-av";
import { createOrUpdatePost } from "../../services/postService";

const NewPost = () => {
  const post = useLocalSearchParams();
  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(file);

  useEffect(() => {
    if (post && post.id) {
      bodyRef.current = post.body;
      setFile(post.file || null);
      setTimeout(() => {
        editorRef?.current?.setContentHTML(post.body);
      }, 300);
    }
  }, []);

  const onPick = async (isImage) => {
    let mediaConfig = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    };

    if (!isImage) {
      mediaConfig = {
        mediaTypes: ["videos"],
        allowsEditing: true,
      };
    }

    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const isLocalFile = (file) => {
    if (!file) {
      return null;
    }
    if (typeof file == "object") {
      return true;
    }
  };

  const getFileType = (file) => {
    if (!file) {
      return null;
    }
    if (isLocalFile(file)) {
      return file.type;
    }

    if (file.includes("postImages")) {
      return "image";
    }
    return "video";
  };

  const getFileUri = (file) => {
    if (!file) {
      return null;
    }
    if (isLocalFile(file)) {
      return file.uri;
    }
    return getSupabaseFileUrl(file)?.uri;
  };

  const onSubmit = async () => {
    const content = bodyRef.current;
    if (!content.trim() && !file) {
      return Alert.alert(
        "Error",
        "Debes ingresar un contenido o seleccionar un archivo."
      );
    }

    const data = {
      file,
      body: content,
      userId: user?.id,
      ...(post?.id && { id: post.id }),
    };

    try {
      setLoading(true);
      const { error } = await createOrUpdatePost(data);

      if (error) {
        throw error;
      }

      Alert.alert(
        "Éxito",
        post?.id
          ? "Tu publicación se ha actualizado."
          : "Tu publicación se ha creado."
      );

      router.push("home");
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al publicar. Inténtalo de nuevo.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header leftComponent={<BackButton />} title="Crear Post" />
        <ScrollView contentContainerStyle={{ gap: 30 }}>
          <View style={styles.header}>
            <Avatar
              uri={user?.image}
              size={hp(6.5)}
              rounded={theme.radius.xl}
            />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>{user?.name || "Usuario"}</Text>
              <Text style={styles.publicText}>Public</Text>
            </View>
          </View>
          <View style={styles.textEditor}>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body) => (bodyRef.current = body)}
            />
          </View>

          {file && (
            <View style={styles.file}>
              {getFileType(file) == "video" ? (
                <Video
                  style={{ flex: 1 }}
                  source={{ uri: getFileUri(file) }}
                  useNativeControls
                  contentFit="cover"
                  isLooping
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file) }}
                  contentFit="cover"
                  style={{ flex: 1 }}
                />
              )}

              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Eliminar />
              </Pressable>
            </View>
          )}

          <View style={styles.media}>
            <Text style={styles.addImageText}>Sube tu publicación</Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Imagen />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <Videos />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Button
          buttonStyle={{ height: hp(6.2) }}
          title={post && post.id ? "Update" : "Post"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  textEditor: {},
  media: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: " rgba(0, 0, 0, 0.6)",
  },
});
