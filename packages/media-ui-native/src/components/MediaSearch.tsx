import {
    useEffect,
    useState,
} from "react";

import type { MediaSearchProps } from "../types/components";

import { useMediaSearch } from "../hooks/useMediaSearch";

import { MediaGrid } from "./MediaGrid";
import { MediaPagination } from "./MediaPagination";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

import {
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

import { styles } from "../styles/styles";

export function MediaSearch({
    client,
    initialQuery = "",
    type = "photo",
    perPage = 20,
    onResults,
    onError,
}: MediaSearchProps) {
    const [
        input,
        setInput,
    ] = useState(
        initialQuery
    );

    const media =
        useMediaSearch({
            client,
            initialQuery,
            type,
            perPage,
        });

    useEffect(() => {
        if (media.result) {
            onResults?.(
                media.result
            );
        }
    }, [
        media.result,
        onResults,
    ]);

    useEffect(() => {
        if (media.error) {
            onError?.(
                media.error
            );
        }
    }, [
        media.error,
        onError,
    ]);

    const handleSearch =
        () => {
            void media.search(
                input
            );
        };

    return (
        <View
            style={styles.container}
        >
            <View
                style={
                    styles.searchForm
                }
            >
                <Text>
                    Search media
                </Text>

                <View
                    style={
                        styles.searchRow
                    }
                >
                    <TextInput
                        value={input}
                        onChangeText={
                            setInput
                        }
                        placeholder="Search photos..."
                        style={
                            styles.input
                        }
                        returnKeyType="search"
                        onSubmitEditing={
                            handleSearch
                        }
                        accessibilityLabel="Search media"
                    />

                    <Pressable
                        onPress={
                            handleSearch
                        }
                        disabled={
                            media.loading ||
                            !input.trim()
                        }
                        style={[
                            styles.button,
                            (
                                media.loading ||
                                !input.trim()
                            ) &&
                            styles.buttonDisabled,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Search"
                    >
                        <Text
                            style={
                                styles.buttonText
                            }
                        >
                            Search
                        </Text>
                    </Pressable>
                </View>
            </View>

            {media.loading && (
                <LoadingState />
            )}

            {!media.loading &&
                !!media.error && (
                    <ErrorState
                        error={media.error as Error}
                        onRetry={() =>
                            void media.search()
                        }
                    />
                )}

            {!media.loading &&
                !media.error &&
                media.items.length ===
                0 && (
                    <EmptyState
                        query={
                            media.query
                        }
                    />
                )}

            {!media.error &&
                media.items.length >
                0 && (
                    <>
                        <MediaGrid
                            items={
                                media.items
                            }
                            onMediaPress={(
                                item
                            ) => {
                                client.trackView(
                                    item.id,
                                    item.type
                                );
                            }}
                        />

                        {media.result && (
                            <MediaPagination
                                page={
                                    media.result
                                        .pagination
                                        .page
                                }
                                hasNextPage={
                                    media.result
                                        .pagination
                                        .hasNextPage
                                }
                                loading={
                                    media.loading
                                }
                                onPageChange={(
                                    page
                                ) =>
                                    void media.setPage(
                                        page
                                    )
                                }
                            />
                        )}
                    </>
                )}
        </View>
    );
}