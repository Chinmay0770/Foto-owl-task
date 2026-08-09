import type { MediaClientConfig } from "../types/config";
import type {
  CuratedParams,
  MediaResult,
  SearchParams,
} from "../types/api";
import type { MediaEvents } from "../events/events";
import { EventEmitter } from "../events/EventEmitter";
import { RequestCache } from "../cache/RequestCache";
import { MediaError } from "../errors/MediaError";

const DEFAULT_BASE_URL = "https://api.pexels.com/v1";
const DEFAULT_PER_PAGE = 20;
const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_CACHE_TTL = 60_000;

export class MediaClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  private readonly cache: RequestCache;

  private readonly events =
    new EventEmitter<MediaEvents>();

  private readonly pendingRequests =
    new Map<string, Promise<unknown>>();

  constructor(config: MediaClientConfig) {
    if (!config.apiKey) {
      throw new MediaError(
        "Pexels API key is required.",
        {
          code: "AUTHENTICATION_ERROR",
        }
      );
    }

    this.apiKey = config.apiKey;
    this.baseUrl =
      config.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout =
      config.timeout ?? DEFAULT_TIMEOUT;

    this.cache = new RequestCache(
      config.cacheTtl ?? DEFAULT_CACHE_TTL
    );
  }

  on<K extends keyof MediaEvents>(
    event: K,
    listener: (payload: MediaEvents[K]) => void
  ): () => void {
    return this.events.on(event, listener);
  }

  trackView(
    mediaId: number,
    mediaType: "photo" | "video"
  ): void {
    const event = {
      mediaId,
      mediaType,
      timestamp: Date.now(),
    };

    console.log("[media-core] view", event);

    this.events.emit("view", event);
  }

  trackDownload(
    mediaId: number,
    mediaType: "photo" | "video"
  ): void {
    const event = {
      mediaId,
      mediaType,
      timestamp: Date.now(),
    };

    console.log("[media-core] download", event);

    this.events.emit("download", event);
  }

  async search(
    params: SearchParams
  ): Promise<MediaResult> {
    const page = params.page ?? 1;
    const perPage =
      params.perPage ?? DEFAULT_PER_PAGE;

    const query = params.query.trim();

    if (!query) {
      throw new MediaError(
        "Search query cannot be empty.",
        {
          code: "INVALID_REQUEST",
        }
      );
    }

    return this.request<MediaResult>(
      `/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      `search:${query}:${page}:${perPage}`
    );
  }

  async curated(
    params: CuratedParams = {}
  ): Promise<MediaResult> {
    const page = params.page ?? 1;
    const perPage =
      params.perPage ?? DEFAULT_PER_PAGE;

    return this.request<MediaResult>(
      `/curated?page=${page}&per_page=${perPage}`,
      `curated:${page}:${perPage}`
    );
  }

  private async request<T>(
    path: string,
    cacheKey: string
  ): Promise<T> {
    const cached =
      this.cache.get<T>(cacheKey);

    if (cached) {
      return cached;
    }

    const pending =
      this.pendingRequests.get(cacheKey);

    if (pending) {
      return pending as Promise<T>;
    }

    const promise =
      this.executeRequest<T>(path)
        .then((result) => {
          this.cache.set(cacheKey, result);
          return result;
        })
        .finally(() => {
          this.pendingRequests.delete(cacheKey);
        });

    this.pendingRequests.set(
      cacheKey,
      promise
    );

    return promise;
  }

  private async executeRequest<T>(
    path: string
  ): Promise<T> {
    const controller = new AbortController();

    const timeoutId = setTimeout(
      () => controller.abort(),
      this.timeout
    );

    try {
      const response = await fetch(
        `${this.baseUrl}${path}`,
        {
          method: "GET",
          headers: {
            Authorization: this.apiKey,
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw this.createApiError(
          response.status
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof MediaError) {
        throw error;
      }

      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        throw new MediaError(
          "The request timed out.",
          {
            code: "TIMEOUT",
            cause: error,
          }
        );
      }

      throw new MediaError(
        "Failed to communicate with the media API.",
        {
          code: "NETWORK_ERROR",
          cause: error,
        }
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private createApiError(
    status: number
  ): MediaError {
    if (status === 401) {
      return new MediaError(
        "Invalid media API credentials.",
        {
          code: "AUTHENTICATION_ERROR",
          status,
        }
      );
    }

    if (status === 404) {
      return new MediaError(
        "Media resource was not found.",
        {
          code: "NOT_FOUND",
          status,
        }
      );
    }

    if (status === 429) {
      return new MediaError(
        "Media API rate limit exceeded.",
        {
          code: "RATE_LIMITED",
          status,
        }
      );
    }

    if (status >= 400 && status < 500) {
      return new MediaError(
        "Invalid media API request.",
        {
          code: "INVALID_REQUEST",
          status,
        }
      );
    }

    return new MediaError(
      "Media API request failed.",
      {
        code: "API_ERROR",
        status,
      }
    );
  }
}