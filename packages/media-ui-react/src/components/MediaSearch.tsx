import {
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import type {
    MediaSearchProps,
    MediaSearchType,
} from "../types/components";

import { MediaGrid } from "./MediaGrid";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import React from "react";

export function MediaSearch({
    initialQuery = "",
    type = "photo",
    items = [],
    loading = false,
    error = null,
    hasNextPage = false,
    onSearch,
    onTypeChange,
    onLoadMore,
    onMediaClick,
    className = "",
}: MediaSearchProps) {
    const [
        input,
        setInput,
    ] = useState(initialQuery);

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const query =
            input.trim();

        if (!query) {
            return;
        }

        void onSearch?.(query);
    };

    const errorMessage =
        error instanceof Error
            ? error.message
            : error != null
                ? String(error)
                : "";

    return (
        <section
            className={`media-search ${className}`}
        >
            <form
                className="media-search__form"
                onSubmit={handleSubmit}
            >
                <label htmlFor="media-search-input">
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
                        placeholder="Search media..."
                    />

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !input.trim()
                        }
                    >
                        Search
                    </button>
                </div>

                <fieldset>
                    <legend>
                        Media type
                    </legend>

                    <label>
                        <input
                            type="radio"
                            name="media-type"
                            checked={
                                type === "photo"
                            }
                            onChange={() =>
                                onTypeChange?.(
                                    "photo"
                                )
                            }
                        />
                        Photos
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="media-type"
                            checked={
                                type === "video"
                            }
                            onChange={() =>
                                onTypeChange?.(
                                    "video"
                                )
                            }
                        />
                        Videos
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="media-type"
                            value="both"
                            aria-label="Both photos and videos"
                            checked={type === "both"}
                            onChange={() => onTypeChange?.("both")}
                        />
                        Photos & Videos
                    </label>
                </fieldset>
            </form>

            {loading &&
                items.length === 0 && (
                    <LoadingState />
                )}

            {!loading &&
                error != null && (
                    <ErrorState
                        error={errorMessage}
                        onRetry={() =>
                            void onSearch?.(
                                input.trim()
                            )
                        }
                    />
                )}

            {!loading &&
                error == null &&
                items.length === 0 && (
                    <EmptyState
                        query={input}
                    />
                )}

            {items.length > 0 && (
                <MediaGrid
                    items={items}
                    loading={loading}
                    hasNextPage={
                        hasNextPage
                    }
                    onLoadMore={
                        onLoadMore
                    }
                    onMediaClick={
                        onMediaClick
                    }
                />
            )}
        </section>
    );
}