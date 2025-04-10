//services/postService.js
import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
  try {
    if (post.file && typeof post.file == "object") {
      let isImage = post?.file?.type == "image";
      let folderName = isImage ? "postImages" : "postVideos";
      let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
      if (fileResult.success) {
        post.file = fileResult.data;
      } else {
        return fileResult;
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .upsert(post)
      .select()
      .single();
    if (error) {
      return { succes: false, msg: "No se creó tu post" };
    } else {
      return { succes: false, msg: "No se pudo crear tu post" };
    }
  } catch (error) {
    return { succes: false, msg: "No se creó tu post" };
  }
};

export const fetchPosts = async (limit = 10, userId) => {
  try {
    if (userId) {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, user: users(id, name, image), postLikes(*), comments (count)"
        )
        .order("created_at", { ascending: false })
        .eq("userId", userId) // Filtramos solo los posts del usuario
        .limit(limit);
      if (error) {
        return { succes: false, msg: "No se fetcheó tu post" };
      }
      return { succes: true, data: data };
    } else {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, user: users(id, name, image), postLikes(*), comments (count)"
        )
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) {
        return { succes: false, msg: "No se fetcheó tu post" };
      }
      return { succes: true, data: data };
    }
  } catch (error) {
    return { succes: false, msg: "No se fetcheó tu post" };
  }
};

export const createPostLike = async (postLike) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postLike)
      .select();

    if (error) {
      return { success: false, msg: "No se pudo realizar el like" };
    }
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, msg: "No se pudo realizar el like" };
  }
};

export const removePostLike = async (postId, userId) => {
  try {
    const { error } = await supabase
      .from("postLikes")
      .delete()
      .eq("userId", userId)
      .eq("postId", postId);

    if (error) {
      return { success: false, msg: "No se pudo quitar el like" };
    }
    return { success: true };
  } catch (error) {
    return { success: false, msg: "No se pudo quitar el like" };
  }
};

export const fetchPostsDetails = async (postId) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "*, user: users(id, name, image),postLikes(*), comments (*, user: users(id, name, image))"
      )
      .eq("id", postId)
      .order("created_at", { ascending: false, foreignTable: "comments" })
      .single();
    if (error) {
      return { succes: false, msg: "No se fetcheó tu post" };
    }
    return { succes: true, data: data };
  } catch (error) {
    return { succes: false, msg: "No se fetcheó tu post" };
  }
};

export const createComment = async (comment) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) {
      return { success: false, msg: "No se pudo realizar el comentario" };
    }
    return { success: true, data: data };
  } catch (error) {
    return { success: false, msg: "No se pudo realizar el comentario" };
  }
};

export const removeComment = async (commentId) => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      return { success: false, msg: "No se pudo quitar el comentario" };
    }
    return { success: true, data: { commentId } };
  } catch (error) {
    return { success: false, msg: "No se pudo quitar el comentario" };
  }
};

export const removePost = async (postId) => {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      return { success: false, msg: "No se pudo quitar el post" };
    }
    return { success: true, data: { postId } };
  } catch (error) {
    return { success: false, msg: "No se pudo quitar el post" };
  }
};
