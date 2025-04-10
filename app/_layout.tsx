import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import React, { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userServices";
import { User } from "@supabase/supabase-js"; // Importamos el tipo User
import { LogBox } from "react-native";

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout></MainLayout>
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    LogBox.ignoreLogs([
      "Warning: MemoizedTNodeRenderer",
      "Warning: TNodeChildrenRenderer",
      "Warning: TRenderEngineProvider",
      "Warning: Encountered two children with the same key",
    ]);
    supabase.auth.onAuthStateChange((_event, session) => {
      // console.log("session user: ", session?.user?.id);
      if (session) {
        setAuth(session?.user);
        updateUserData(session?.user, session?.user?.email);
        router.replace("./home");
      } else {
        setAuth(null);
        router.replace("/welcome");
      }
    });
  }, []);

  const updateUserData = async (user: User | null, email) => {
    if (!user) return; // Evita llamadas innecesarias si user es null

    let res = await getUserData(user.id);
    if (res.success) {
      setUserData({ ...res.data, email });
    }
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(main)/postDetails"
        options={{ presentation: "modal" }}
      ></Stack.Screen>
    </Stack>
  );
};

export default _layout;
