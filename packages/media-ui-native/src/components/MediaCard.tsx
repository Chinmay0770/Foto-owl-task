import {
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import type { MediaCardProps } from "../types/components";

import { styles } from "../styles/styles";

export function MediaCard({
  media,
  onPress,
}: MediaCardProps) {
  const imageSource =
    media.type ===
      "photo"
      ? media.src?.large ??
        media.src?.medium ??
        media.url
      : media.src?.original ??
        media.url;

  return (
    <Pressable
      onPress={() =>
        onPress?.(media)
      }
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={
        media.alt ??
        `Media by ${
          media.photographer ??
          "unknown creator"
        }`
      }
    >
      <Image
        source={{
          uri: imageSource,
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <View
        style={
          styles.cardContent
        }
      >
        <Text
          style={
            styles.photographer
          }
        >
          {media.photographer ??
            "Unknown creator"}
        </Text>

        {media.type ===
          "video" &&
          media.duration !==
            undefined && (
            <Text>
              {media.duration}s
            </Text>
          )}
      </View>
    </Pressable>
  );
}