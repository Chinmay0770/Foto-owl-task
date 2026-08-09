import {
    useEffect,
    useState,
} from "react";
import type { FormEvent } from "react";

import type { MediaSearchProps } from "../types/components";

import { useMediaSearch } from "../hooks/useMediaSearch";

import { MediaGrid } from "./MediaGrid";
import { MediaPagination } from "./MediaPagination";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import React from "react";

export function MediaSearch({
    client,
    initialQuery = "",
    type = "photo",
    perPage = 20,
    onResults,
    onError,
    className = "",
}: MediaSearchProps) {
    const [
        input,
        setInput,
    ] = useState(initialQuery);

    const media = useMediaSearch({
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

    const errorMessage =
        media.error instanceof Error
            ? media.error.message
            : String(media.error);

    const handleSubmit = (
        event: FormEvent
    ) => {
        event.preventDefault();

        void media.search(
            input
        );
    };

    return (
        <section
            className={`media-search ${className}`}
        >
            <form
                className="media-search__form"
                onSubmit={
                    handleSubmit
                }
            >
                <label
                    htmlFor="media-search-input"
                >
                    Search media
                </label>

                <div>
                    <input
                        id="media-search-input"
                        value={input}
                        onChange={(event) =>
                            setInput(
                                event.target.value
                            )
                        }
                        placeholder="Search photos..."
                    />

                    <button
                        type="submit"
                        disabled={
                            media.loading ||
                            !input.trim()
                        }
                    >
                        Search
                    </button>
                </div>
            </form>

            {media.loading && (
                <LoadingState />
            )}

            {!media.loading &&
                media.error != null && (
                    <ErrorState
                        error={errorMessage}
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
                            onMediaClick={(
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
        </section>
    );
}