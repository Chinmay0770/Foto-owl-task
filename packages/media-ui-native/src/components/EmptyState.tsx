import {
  Text,
  View,
} from "react-native";

import { styles } from "../styles/styles";

interface EmptyStateProps {
  query?: string;
}

export function EmptyState({
  query,
}: EmptyStateProps) {
  return (
    <View
      style={styles.empty}
    >
      <Text>
        {query
          ? `No media found for "${query}".`
          : "Search for media to get started."}
      </Text>
    </View>
  );
}