import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import React from "react";
import { useSignUp } from "@clerk/clerk-expo";
import { authStyles } from "@/assets/styles/auth.styles";
import { Image } from "expo-image";
import { COLORS } from "@/constant/colors";

const VerifyEmail = ({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleVerify = async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (error: any) {
      Alert.alert("Error", error.errors?.[0]?.message || "Verification failed");
      console.error(JSON.stringify(error, null, 2));
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
          {/* Image Container */}
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/i3.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          {/* Title */}
          <Text style={authStyles.title}>Verify Your Email</Text>
          <Text style={authStyles.subtitle}>
            We&apos;ve sent a verification code to {email}
          </Text>

          <View style={authStyles.formContainer}>
            {/* Verification Code Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter verification code"
                placeholderTextColor={COLORS.textLight}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                authStyles.authButton,
                loading && authStyles.buttonDisabled,
              ]}
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Verifying..." : "Verify Email"}
              </Text>
            </TouchableOpacity>

            {/* Back to Sign Up */}
            <TouchableOpacity style={authStyles.linkContainer} onPress={onBack}>
              <Text style={authStyles.linkText}>
                <Text style={authStyles.link}>Back to Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyEmail;
