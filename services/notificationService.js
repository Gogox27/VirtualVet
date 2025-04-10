import { supabase } from "../lib/supabase";

export const createNotification = async (notification) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error("Error creando notificación:", error);
      return {
        success: false,
        msg: "Algo salió mal al crear la notificación.",
      };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error en la creación de la notificación:", error);
    return { success: false, msg: "Algo salió mal al crear la notificación." };
  }
};

export const fetchNotifications = async (receiverId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*, sender: senderId(id, name, image)")
      .eq("receiverId", receiverId)
      .order("created_at", { ascending: false });

    if (error) {
      return { succes: false, msg: "No se fetcheó tu Notificación" };
    }
    return { succes: true, data: data };
  } catch (error) {
    return { succes: false, msg: "No se fetcheó tu Notificación" };
  }
};
