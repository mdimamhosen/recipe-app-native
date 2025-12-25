import { View, Text, Alert, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { favoritesStyles } from "../../assets/styles/favorites.styles";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { API_URL } from './../../constant/api';
import { COLORS } from "@/constant/colors";
import { useRouter } from "expo-router";

const FavoritesScreen = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  interface Favorite {
    id: string;
    recipeId: string;
    [key: string]: any;
  }

  interface TransformedFavorite extends Favorite {
    id: string;
    title: string;
    image: string;
  }

  const [favoriteRecipes, setFavoriteRecipes] = useState<TransformedFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user || !user.id) {
        setFavoriteRecipes([]);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/favorites/${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch favorites");

        const favorites = await response.json();

        // transform the data to match the RecipeCard component's expected format
        // (interfaces already defined at the top of the file)

        // Fetch full recipe details for each favorite
        const recipesResponse = await fetch(`${API_URL}/recipes`);
        if (!recipesResponse.ok) throw new Error("Failed to fetch recipes");
        const allRecipes = await recipesResponse.json();

        const transformedFavorites: TransformedFavorite[] = favorites.map((favorite: Favorite) => {
          const recipeDetails = allRecipes.find((r: any) => r.id === favorite.recipeId);
          return {
            ...favorite,
            id: favorite.recipeId,
            title: recipeDetails?.title || "Unknown Title",
            image: recipeDetails?.image || "",
            // add other required fields if needed
          };
        });

        setFavoriteRecipes(transformedFavorites);
      } catch (error) {
        console.log("Error loading favorites", error);
        Alert.alert("Error", "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user?.id]);

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: () => signOut() },

    ]);
  };

  if (loading) return <LoadingSpinner message="Loading your favorites..." />;

  return (
    <View style={favoritesStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={favoritesStyles.header}>
          <Text style={favoritesStyles.title}>Favorites</Text>
          <TouchableOpacity style={favoritesStyles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={favoritesStyles.recipesSection}>
          <FlatList
            data={favoriteRecipes}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={favoritesStyles.row}
            contentContainerStyle={favoritesStyles.recipesGrid}
            scrollEnabled={false}
            ListEmptyComponent={<NoFavoritesFound />}
          />
        </View>
      </ScrollView>
    </View>
  );
};
export default FavoritesScreen;



function NoFavoritesFound() {
  const router = useRouter();

  return (
    <View style={favoritesStyles.emptyState}>
      <View style={favoritesStyles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={80} color={COLORS.textLight} />
      </View>
      <Text style={favoritesStyles.emptyTitle}>No favorites yet</Text>
      <TouchableOpacity style={favoritesStyles.exploreButton} onPress={() => router.push("/")}>
        <Ionicons name="search" size={18} color={COLORS.white} />
        <Text style={favoritesStyles.exploreButtonText}>Explore Recipes</Text>
      </TouchableOpacity>
    </View>
  );
}

 