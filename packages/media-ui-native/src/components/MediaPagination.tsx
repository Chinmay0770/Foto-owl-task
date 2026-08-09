import {
  Pressable,
  Text,
  View,
} from "react-native";
import type { ReactElement } from "react";

import { styles } from "../styles/styles";

interface MediaPaginationProps {
  page: number;

  hasNextPage: boolean;

  loading: boolean;

  onPageChange: (
    page: number
  ) => void;
}

export function MediaPagination({
  page,
  hasNextPage,
  loading,
  onPageChange,
}: MediaPaginationProps): ReactElement {
  return (
    <View
      style={
        styles.pagination
      }
    >
      <Pressable
        disabled={
          loading ||
          page <= 1
        }
        onPress={() =>
          onPageChange(
            page - 1
          )
        }
        style={[
          styles.button,
          (
            loading ||
            page <= 1
          ) &&
            styles.buttonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Previous page"
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Previous
        </Text>
      </Pressable>

      <Text
        style={
          styles.pageText
        }
      >
        Page {page}
      </Text>

      <Pressable
        disabled={
          loading ||
          !hasNextPage
        }
        onPress={() =>
          onPageChange(
            page + 1
          )
        }
        style={[
          styles.button,
          (
            loading ||
            !hasNextPage
          ) &&
            styles.buttonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Next page"
      >
        <Text
          style={
            styles.buttonText
          }
        >
          Next
        </Text>
      </Pressable>
    </View>
  );
}