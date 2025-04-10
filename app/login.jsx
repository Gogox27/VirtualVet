import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Input from "../components/Input";
import Mail from "../assets/icons/Mail";
import Candado from "../assets/icons/Candado";
import { supabase } from "../lib/supabase";
import Button from "../components/Button";

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Inicio de sesión", "Por favor llena todos los espacios.");
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScreenWrapper bg={"white"}>
        <StatusBar style="dark" />
        <View style={styles.container}>
          <BackButton router={router} />

          <View>
            <Text style={styles.welcomeText}>Hey,</Text>
            <Text style={styles.welcomeText}>Bienvenido de Vuelta</Text>
          </View>

          <View style={styles.form}>
            <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
              Por favor inicie sesión para continuar
            </Text>
            <Input
              placeholder="Ingresa tu correo"
              onChangeText={(value) => {
                emailRef.current = value;
              }}
              icon={<Mail size={26} color="black" />}
            />
            <Input
              placeholder="Ingresa tu contraseña"
              onChangeText={(value) => {
                passwordRef.current = value;
              }}
              secureTextEntry
              icon={<Candado />}
            />
            <Text style={styles.forgotPassword}>¿Olvidaste la contraseña?</Text>

            <Button
              title="Iniciar Sesión"
              onPress={onSubmit}
              loading={loading}
            ></Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
            <Pressable onPress={() => router.push("/signUp")}>
              <Text
                style={[
                  styles.footerText,
                  {
                    color: theme.colors.primaryDark,
                    fontWeight: theme.fonts.semibold,
                  },
                ]}
              >
                Registrarse
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenWrapper>
    </TouchableWithoutFeedback>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
  buttonStyle: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.xl,
    width: "100%", // Hace que el botón sea ancho
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLoading: {
    backgroundColor: "transparent", // Hace que el fondo desaparezca
  },
  buttonText: {
    color: "white",
    fontSize: hp(2),
    fontWeight: "bold",
  },
});
