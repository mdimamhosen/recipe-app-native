/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { MealAPI } from "@/services/mealAPI";
import LoadingSpinner from "../../components/LoadingSpinner";
import { homeStyles } from "./../../assets/styles/home.styles";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constant/colors";
import RecipeCard from "@/components/RecipeCard";
// import CategoryFilter from "@/components/CategoryFilter";
import CategoryFilter from "../../components/CategoryFilter";

const HomePage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<
    {
      id: string;
      title: any;
      description: string;
      image: any;
      cookTime: string;
      servings: number;
      category: any;
      area: any;
      ingredients: string[];
      instructions: any;
      originalData: any;
      youtubeUrl: any;
    }[]
  >([]);
  interface Category {
    id: number;
    title: string;
    image: string;
    description: string;
  }
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredRecipe, setFeaturedRecipe] = useState<{
    id: string;
    title: any;
    description: string;
    image: any;
    cookTime: string;
    servings: number;
    category: any;
    area: any;
    ingredients: string[];
    instructions: any;
    originalData: any;
    youtubeUrl: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [apiCategories, randomMeals, featuredMeal] = await Promise.all([
        MealAPI.getCategories(),
        MealAPI.getRandomMeals(12),
        MealAPI.getRandomMeal(),
      ]);

      const transformedCategories: Category[] = apiCategories.map(
        (
          cat: {
            strCategory: string;
            strCategoryThumb: string;
            strCategoryDescription: string;
          },
          index: number
        ) => ({
          id: index + 1,
          title: cat.strCategory,
          image: cat.strCategoryThumb,
          description: cat.strCategoryDescription,
        })
      );

      setCategories(transformedCategories);

      if (!selectedCategory) setSelectedCategory(transformedCategories[0].title);

      const transformedMeals = randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);

      setRecipes(transformedMeals);

      const transformedFeatured = MealAPI.transformMealData(featuredMeal);
      setFeaturedRecipe(transformedFeatured);
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  };

  interface Meal {
    id: any;
    title: any;
    description: string;
    image: any;
    cookTime: string;
    servings: number;
    category: any;
    area: any;
    ingredients: string[];
    instructions: any;
    originalData: any;
    youtubeUrl: any;
  }

  const loadCategoryData = async (category: string): Promise<void> => {
    try {
      const meals: any[] = await MealAPI.filterByCategory(category);
      const transformedMeals = meals
        .map((meal: any) => MealAPI.transformMealData(meal))
        .filter((meal): meal is Meal => meal !== null);
      setRecipes(transformedMeals);
    } catch (error) {
      console.error("Error loading category data:", error);
      setRecipes([]);
    }
  };

  interface HandleCategorySelect {
    (category: string): Promise<void>;
  }

  const handleCategorySelect: HandleCategorySelect = async (category) => {
    setSelectedCategory(category);
    await loadCategoryData(category);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // await sleep(2000);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);
  if (loading && !refreshing)
    return <LoadingSpinner message="Loading delicions recipes..." />;
  return (
    <View style={homeStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={homeStyles.scrollContent}
      >
        <View style={homeStyles.welcomeSection}>
          <Image
            source={require("../../assets/images/lamb.png")}
            style={{
              width: 100,
              height: 100,
            }}
          />
          <Image
            source={require("../../assets/images/chicken.png")}
            style={{
              width: 100,
              height: 100,
            }}
          />
          <Image
            source={require("../../assets/images/cow.png")}
            style={{
              width: 100,
              height: 100,
            }}
          />
        </View>

        {featuredRecipe && (
          <View style={homeStyles.featuredSection}>
            <TouchableOpacity
              style={homeStyles.featuredCard}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/recipe/[id]",
                  params: { id: featuredRecipe.id },
                })
              }
            >
              <View style={homeStyles.featuredImageContainer}>
                <Image
                  source={{ uri: featuredRecipe.image }}
                  style={homeStyles.featuredImage}
                  contentFit="cover"
                  transition={500}
                />
                <View style={homeStyles.featuredOverlay}>
                  <View style={homeStyles.featuredBadge}>
                    <Text style={homeStyles.featuredBadgeText}>Featured</Text>
                  </View>

                  <View style={homeStyles.featuredContent}>
                    <Text style={homeStyles.featuredTitle} numberOfLines={2}>
                      {featuredRecipe.title}
                    </Text>

                    <View style={homeStyles.featuredMeta}>
                      <View style={homeStyles.metaItem}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={COLORS.white}
                        />
                        <Text style={homeStyles.metaText}>
                          {featuredRecipe.cookTime}
                        </Text>
                      </View>
                      <View style={homeStyles.metaItem}>
                        <Ionicons
                          name="people-outline"
                          size={16}
                          color={COLORS.white}
                        />
                        <Text style={homeStyles.metaText}>
                          {featuredRecipe.servings}
                        </Text>
                      </View>
                      {featuredRecipe.area && (
                        <View style={homeStyles.metaItem}>
                          <Ionicons
                            name="location-outline"
                            size={16}
                            color={COLORS.white}
                          />
                          <Text style={homeStyles.metaText}>
                            {featuredRecipe.area}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

       {categories.length > 0 && (
         <CategoryFilter
           categories={categories}
           selectedCategory={selectedCategory}
           onSelectCategory={handleCategorySelect}
         />
        )}

        <View style={homeStyles.recipesSection}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>{selectedCategory}</Text>
          </View>

          {recipes.length > 0 ? (
            <FlatList
              data={recipes}
              renderItem={({ item }) => <RecipeCard recipe={item} />}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={homeStyles.row}
              contentContainerStyle={homeStyles.recipesGrid}
              scrollEnabled={false}
              // ListEmptyComponent={}
            />
          ) : (
            <View style={homeStyles.emptyState}>
              <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
              <Text style={homeStyles.emptyTitle}>No recipes found</Text>
              <Text style={homeStyles.emptyDescription}>Try a different category</Text>
            </View>
          )}
        </View>
        </ScrollView>
    </View>
  );
};

export default HomePage;
