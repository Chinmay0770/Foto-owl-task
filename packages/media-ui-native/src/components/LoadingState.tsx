import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";

import type { ReactElement } from "react";
import { styles } from "../styles/styles";

export function LoadingState(): ReactElement {
  return (
    <View
      style={styles.loading}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator />

      <Text>
        Loading media...
      </Text>
    </View>
  );
}