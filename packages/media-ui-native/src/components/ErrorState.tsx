import {
  Pressable,
  Text,
  View,
} from "react-native";

import type { ReactElement } from "react";

import { styles } from "../styles/styles";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error == null) {
    return "Something went wrong.";
  }

  try {
    const serialized =
      JSON.stringify(error);

    return serialized || "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export function ErrorState({
  error,
  onRetry,
}: ErrorStateProps): ReactElement {
  const message =
    getErrorMessage(error);

  return (
    <View
      style={styles.error}
      accessibilityRole="alert"
    >
      <Text>{message}</Text>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Retry
          </Text>
        </Pressable>
      )}
    </View>
  );
}