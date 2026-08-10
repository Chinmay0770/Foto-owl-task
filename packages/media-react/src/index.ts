import {
  useCallback,
  useState,
} from "react";

import type {
  MediaClient,
  MediaItem,
  MediaResult,
  MediaType,
} from "@headless-media/media-core";

export type MediaSearchType =
  | MediaType
  | "both";

export interface UseMediaSearchOptions {
  client: MediaClient;
  initialQuery?: string;
  type?: MediaSearchType;
  perPage?: number;
}

export interface UseMediaSearchResult {
  query: string;
  type: MediaSearchType;

  items: MediaItem[];

  loading: boolean;
  error: unknown;

  page: number;
  hasNextPage: boolean;

  search: (
    value?: string
  ) => Promise<void>;

  loadMore: () => Promise<void>;

  clear: () => void;
}

export function useMediaSearch({
  client,
  initialQuery = "",
  type = "photo",
  perPage = 20,
}: UseMediaSearchOptions): UseMediaSearchResult {
  const [query, setQuery] =
    useState(initialQuery);

  const [currentType, setCurrentType] =
    useState<MediaSearchType>(type);

  const [items, setItems] =
    useState<MediaItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<unknown>(null);

  const [page, setPage] =
    useState(1);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  const fetchPage = useCallback(
    async (
      searchQuery: string,
      searchType: MediaSearchType,
      pageNumber: number
    ): Promise<MediaResult> => {
      if (searchType !== "both") {
        return client.search({
          query: searchQuery,
          type: searchType,
          page: pageNumber,
          perPage,
        });
      }

      const [
        photoResult,
        videoResult,
      ] = await Promise.all([
        client.search({
          query: searchQuery,
          type: "photo",
          page: pageNumber,
          perPage,
        }),

        client.search({
          query: searchQuery,
          type: "video",
          page: pageNumber,
          perPage,
        }),
      ]);

      return {
        items: [
          ...photoResult.items,
          ...videoResult.items,
        ],

        pagination: {
          page: pageNumber,
          perPage,

          totalResults:
            photoResult.pagination.totalResults +
            videoResult.pagination.totalResults,

          hasNextPage:
            photoResult.pagination.hasNextPage ||
            videoResult.pagination.hasNextPage,
        },
      };
    },
    [client, perPage]
  );

  const search = useCallback(
    async (value = query) => {
      const trimmed =
        value.trim();

      if (!trimmed) {
        setItems([]);
        setError(null);
        setHasNextPage(false);
        setPage(1);
        return;
      }

      setQuery(value);
      setPage(1);
      setLoading(true);
      setError(null);

      try {
        const result =
          await fetchPage(
            trimmed,
            currentType,
            1
          );

        setItems(result.items);

        setHasNextPage(
          result.pagination.hasNextPage
        );
      } catch (err) {
        setItems([]);
        setError(err);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    },
    [
      query,
      currentType,
      fetchPage,
    ]
  );

  const loadMore = useCallback(
    async () => {
      if (
        loading ||
        !query.trim() ||
        !hasNextPage
      ) {
        return;
      }

      const nextPage =
        page + 1;

      setLoading(true);
      setError(null);

      try {
        const result =
          await fetchPage(
            query.trim(),
            currentType,
            nextPage
          );

        setItems((previous) => [
          ...previous,
          ...result.items,
        ]);

        setPage(nextPage);

        setHasNextPage(
          result.pagination.hasNextPage
        );
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      query,
      hasNextPage,
      page,
      currentType,
      fetchPage,
    ]
  );

  const clear = useCallback(() => {
    setQuery("");
    setItems([]);
    setError(null);
    setPage(1);
    setHasNextPage(false);
  }, []);

  return {
    query,
    type: currentType,
    items,
    loading,
    error,
    page,
    hasNextPage,
    search,
    loadMore,
    clear,
  };
}