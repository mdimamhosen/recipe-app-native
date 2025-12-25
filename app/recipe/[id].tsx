import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import LoadingSpinner from "@/components/LoadingSpinner";
import { API_URL } from "@/constant/api";
import { MealAPI } from "@/services/mealAPI";
import { Ionicons } from "@expo/vector-icons";
import { recipeDetailStyles } from "../../assets/styles/recipe-detail.styles";
import { COLORS } from "@/constant/colors";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";

/* -------------------- TYPES -------------------- */

type RecipeType = {
  id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: string;
  category?: string;
  area?: string;
  youtubeUrl?: string;
  ingredients: string[];
  instructions: string[];

};

/* -------------------- COMPONENT -------------------- */

const Recipe = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoaded  } = useUser();
  const userId = user?.id;

  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* -------------------- EFFECT -------------------- */

  useEffect(() => {
    if (!id) return;

    const checkIfSaved = async () => {
      try {
        if (!userId) return;

        const response = await fetch(`${API_URL}/favorites/${userId}`);
        const favorites = await response.json();

        const saved = favorites.some(
          (fav: { recipeId: number }) =>
            fav.recipeId === Number(id)
        );

        setIsSaved(saved);
      } catch (error) {
        console.error("Error checking favorite:", error);
      }
    };

    const loadRecipeDetail = async () => {
      try {
        setLoading(true);

        const mealData = await MealAPI.getMealById(id);
        const transformed = MealAPI.transformMealData(mealData);

        if (transformed) {
          const mappedRecipe: RecipeType = {
            id: transformed.id,
            title: transformed.title,
            image: transformed.image,
            cookTime: transformed.cookTime,
            servings: String(transformed.servings),
            category: transformed.category,
            area: transformed.area,
            youtubeUrl: transformed.youtubeUrl ?? "", 
            ingredients: transformed.ingredients ?? [],
            instructions: transformed.instructions ?? [],
          };

          setRecipe(mappedRecipe);
        }
      } catch (error) {
        console.error("Error loading recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    checkIfSaved();
    loadRecipeDetail();
  }, [id, userId]);

  /* -------------------- HELPERS -------------------- */

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleToggleSave = async () => {
    if (!userId || !recipe) return;

    setIsSaving(true);

    try {
      if (isSaved) {
        await fetch(`${API_URL}/favorites/${userId}/${id}`, {
          method: "DELETE",
        });
        setIsSaved(false);
      } else {
        await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            recipeId: Number(id),
            title: recipe.title,
            image: recipe.image,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
          }),
        });
        setIsSaved(true);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  /* -------------------- RENDER -------------------- */

  if (loading || !recipe || !isLoaded) {
    return <LoadingSpinner message="Loading recipe details..." />;
  }

  return (
    <View style={recipeDetailStyles.container}>
      <ScrollView>
        {/* HEADER */}
        <View style={recipeDetailStyles.headerContainer}>
          <Image
            source={{ uri: recipe.image }}
            style={recipeDetailStyles.headerImage}
          />

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={recipeDetailStyles.gradientOverlay}
          />

          <View style={recipeDetailStyles.floatingButtons}>
            <TouchableOpacity
              style={recipeDetailStyles.floatingButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={recipeDetailStyles.floatingButton}
              onPress={handleToggleSave}
              disabled={isSaving}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>

          <View style={recipeDetailStyles.titleSection}>
            {recipe.category && (
              <View style={recipeDetailStyles.categoryBadge}>
                <Text style={recipeDetailStyles.categoryText}>
                  {recipe.category}
                </Text>
              </View>
            )}

            <Text style={recipeDetailStyles.recipeTitle}>
              {recipe.title}
            </Text>

            {recipe.area && (
              <View style={recipeDetailStyles.locationRow}>
                <Ionicons name="location" size={16} color={COLORS.white} />
                <Text style={recipeDetailStyles.locationText}>
                  {recipe.area} Cuisine
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* VIDEO */}
        {recipe.youtubeUrl && (
          <WebView
            style={{ height: 220 }}
            source={{ uri: getYouTubeEmbedUrl(recipe.youtubeUrl) }}
            allowsFullscreenVideo
          />
        )}

        {/* INGREDIENTS */}
        <View style={recipeDetailStyles.sectionContainer}>
          <Text style={recipeDetailStyles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((item, index) => (
            <Text key={index} style={recipeDetailStyles.ingredientText}>
              • {item}
            </Text>
          ))}
        </View>

        {/* INSTRUCTIONS */}
        <View style={recipeDetailStyles.sectionContainer}>
          <Text style={recipeDetailStyles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((step, index) => (
            <Text key={index} style={recipeDetailStyles.instructionText}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Recipe;
