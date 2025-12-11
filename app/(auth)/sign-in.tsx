import { View, Text, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constant/colors";
import {Ionicons} from "@expo/vector-icons"
const SignIn = () => {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { signIn, setActive, isLoaded } = useSignIn();

  const handleSignIn = async () => {
    setLoading(true);
    if (email === "" || password === "") {
      Alert.alert("Please fill in all fields");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (!signIn) {
        Alert.alert("SignIn is not loaded yet. Please try again.");
        setLoading(false);
        return;
      }
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });
      if (signInAttempt.status === "complete") {
        if (setActive) {
          await setActive({ session: signInAttempt.createdSessionId });
        }
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (error) {
        console.error("Error during sign in: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/i1.png")}
              style={authStyles.image}
              resizeMode="contain"
            />
          </View>

          <Text style={authStyles.title}>Welcome Back</Text>
          <Text style={authStyles.subtitle}>
            Sign in to your account to continue
          </Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <View style={authStyles.linkContainer}>
              <Text style={authStyles.linkText}>
                Don&apos;t have an account?{" "}
                <Text
                  style={authStyles.link}
                  onPress={() => router.push("/sign-up")}
                >
                  Sign Up
                </Text>
              </Text>
            </View>

            <View style={authStyles.linkContainer}>
              <Text
                style={authStyles.link}
                onPress={() => router.push("/verify-email")}
              >
                Forgot Password?
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignIn;
