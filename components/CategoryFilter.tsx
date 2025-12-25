import {   Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { COLORS } from "@/constant/colors";

interface Category {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: 16 }}
      contentContainerStyle={{ paddingHorizontal: 8 }}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={{
            backgroundColor:
              selectedCategory === category.title ? COLORS.primary : COLORS.white,
            borderRadius: 20,
            paddingVertical: 8,
            paddingHorizontal: 16,
            marginRight: 10,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: selectedCategory === category.title ? COLORS.primary : COLORS.border,
          }}
          onPress={() => onSelectCategory(category.title)}
        >
          <Image
            source={{ uri: category.image }}
            style={{ width: 28, height: 28, borderRadius: 14, marginRight: 8 }}
          />
          <Text
            style={{
              color:
                selectedCategory === category.title ? COLORS.white : COLORS.text,
              fontWeight: selectedCategory === category.title ? "bold" : "normal",
              fontSize: 15,
            }}
          >
            {category.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CategoryFilter;