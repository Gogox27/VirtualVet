import { supabaseUrl } from "../constants/index"; // Asegúrate de la ruta correcta
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import { supabase } from "../lib/supabase";

export const getUserImageSrc = (imagePath) => {
  if (imagePath) {
    return {
      uri: `${supabaseUrl}/storage/v1/object/public/uploads/${imagePath}`,
    };
  } else {
    return require("../assets/images/defaultUser2.png");
  }
};

export const getSupabaseFileUrl = (filePath) => {
  if (filePath) {
    return {
      uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`,
    };
  }
  return null;
};

export const downloadFile = async (url) => {
  try {
    const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url));
    return uri;
  } catch (error) {
    return null;
  }
};

export const getLocalFilePath = (filePath) => {
  let fileName = filePath.split("/").pop();
  return `${FileSystem.documentDirectory}${fileName}`;
};

export const uploadFile = async (folderName, fileUri, isImage = true) => {
  try {
    let fileName = getFilePath(folderName, isImage);
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    let imageData = decode(fileBase64);
    let { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, imageData, {
        cacheControl: "3600",
        upsert: false,
        contentType: isImage ? "image/png" : "video/mp4",
      });

    if (error) {
      console.log("Error al subir archivo:", error);
      return { success: false, msg: "No se pudo subir media" };
    }

    console.log("Ruta del archivo en Supabase:", data.path);

    return { success: true, data: data.path };
  } catch (error) {
    console.log("Archivo error:", error);
    return { success: false, msg: "No se pudo subir media" };
  }
};

export const getFilePath = (folderName, isImage) => {
  return `${folderName}/${new Date().getTime()}${isImage ? ".png" : ".mp4"}`;
};
