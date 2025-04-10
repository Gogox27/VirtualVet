import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
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
import Person from "../assets/icons/Person";
import { supabase } from "../lib/supabase";
import Button from "../components/Button";

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert("Registro", "Por favor llena todos los espacios.");
      return;
    }

    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    // Registrar usuario en Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Sign Up", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScreenWrapper bg={"white"}>
        <StatusBar style="dark" />
        <View style={styles.container}>
          <BackButton router={router} />

          <View>
            <Text style={styles.welcomeText}>Vamos,</Text>
            <Text style={styles.welcomeText}>A Empezar</Text>
          </View>

          <View style={styles.form}>
            <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
              Por favor llena los espacios para crear una cuenta
            </Text>
            <Input
              placeholder="Ingresa tu nombre"
              onChangeText={(value) => {
                nameRef.current = value;
              }}
              icon={<Person />}
            />
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

            <Button
              title="Registrarse"
              onPress={onSubmit}
              loading={loading}
            ></Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ya tengo una cuenta</Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text
                style={[
                  styles.footerText,
                  {
                    color: theme.colors.primaryDark,
                    fontWeight: theme.fonts.semibold,
                  },
                ]}
              >
                Iniciar Sesión
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenWrapper>
    </TouchableWithoutFeedback>
  );
};

export default SignUp;

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
    alignItems: "center",
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
    width: "100%",
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
