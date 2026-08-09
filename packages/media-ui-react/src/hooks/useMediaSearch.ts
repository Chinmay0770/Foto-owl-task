import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  MediaClient,
  MediaItem,
  MediaResult,
  MediaType,
} from "@headless-media/media-core";

interface UseMediaSearchOptions {
  client: MediaClient;

  initialQuery?: string;

  type?: MediaType;

  perPage?: number;
}

interface UseMediaSearchResult {
  query: string;

  items: MediaItem[];

  result: MediaResult | null;

  loading: boolean;

  error: unknown;

  page: number;

  search: (
    value?: string
  ) => Promise<void>;

  setPage: (
    page: number
  ) => Promise<void>;

  clear: () => void;
}

export function useMediaSearch({
  client,
  initialQuery = "",
  type = "photo",
  perPage = 20,
}: UseMediaSearchOptions): UseMediaSearchResult {
  const [
    query,
    setQuery,
  ] = useState(initialQuery);

  const [
    result,
    setResult,
  ] = useState<MediaResult | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<unknown>(null);

  const [
    page,
    setCurrentPage,
  ] = useState(1);

  const search = useCallback(
    async (
      value = query
    ) => {
      const trimmed =
        value.trim();

      if (!trimmed) {
        setResult(null);
        setError(null);
        return;
      }

      setQuery(value);
      setLoading(true);
      setError(null);

      try {
        const response =
          await client.search({
            query: trimmed,
            type,
            page: 1,
            perPage,
          });

        setCurrentPage(1);
        setResult(response);
      } catch (err) {
        setError(err);
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [
      client,
      query,
      type,
      perPage,
    ]
  );

  const setPage =
    useCallback(
      async (
        nextPage: number
      ) => {
        if (!query.trim()) {
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const response =
            await client.search({
              query:
                query.trim(),
              type,
              page: nextPage,
              perPage,
            });

          setCurrentPage(
            nextPage
          );

          setResult(response);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      },
      [
        client,
        query,
        type,
        perPage,
      ]
    );

  const clear = useCallback(() => {
    setQuery("");
    setResult(null);
    setError(null);
    setCurrentPage(1);
  }, []);

  return {
    query,
    items:
      result?.items ?? [],
    result,
    loading,
    error,
    page,
    search,
    setPage,
    clear,
  };
}