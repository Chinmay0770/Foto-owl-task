import {
  FlatList,
} from "react-native";

import type { MediaGridProps } from "../types/components";

import { MediaCard } from "./MediaCard";

import { styles } from "../styles/styles";

export function MediaGrid({
  items,
  numColumns = 2,
  onMediaPress,
}: MediaGridProps) {
  return (
    <FlatList
      data={items}
      numColumns={numColumns}
      keyExtractor={(item) =>
        `${item.type}-${item.id}`
      }
      contentContainerStyle={
        styles.grid
      }
      renderItem={({
        item,
      }) => (
        <MediaCard
          media={item}
          onPress={
            onMediaPress
          }
        />
      )}
      removeClippedSubviews
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}