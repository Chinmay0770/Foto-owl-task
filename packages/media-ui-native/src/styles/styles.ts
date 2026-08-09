import {
  StyleSheet,
} from "react-native";

export const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    searchForm: {
      padding: 16,
      gap: 8,
    },

    searchRow: {
      flexDirection:
        "row",
      gap: 8,
    },

    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#cccccc",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
    },

    button: {
      backgroundColor:
        "#222222",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      justifyContent:
        "center",
      alignItems: "center",
    },

    buttonDisabled: {
      opacity: 0.5,
    },

    buttonText: {
      color: "#ffffff",
      fontSize: 15,
      fontWeight: "600",
    },

    grid: {
      padding: 8,
    },

    card: {
      flex: 1,
      margin: 8,
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor:
        "#ffffff",
      borderWidth: 1,
      borderColor: "#dddddd",
    },

    image: {
      width: "100%",
      aspectRatio: 1,
    },

    cardContent: {
      padding: 10,
    },

    photographer: {
      fontSize: 14,
      fontWeight: "500",
    },

    loading: {
      padding: 32,
      alignItems:
        "center",
    },

    empty: {
      padding: 32,
      alignItems:
        "center",
    },

    error: {
      padding: 32,
      alignItems:
        "center",
    },

    pagination: {
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems: "center",
      gap: 16,
      padding: 16,
    },

    pageText: {
      fontSize: 15,
      fontWeight: "500",
    },
  });