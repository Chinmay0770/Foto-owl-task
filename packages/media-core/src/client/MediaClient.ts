import { RequestCache } from "../cache/RequestCache";
import { EventEmitter } from "../events/EventEmitter";
import type { MediaEvents } from "../events/events";
import { MediaError } from "../errors/MediaError";
import type {
    CuratedParams,
    MediaResult,
    SearchParams,
} from "../types/api";
import type { MediaClientConfig } from "../types/config";
import { PexelsApiClient } from "./PexelsApiClient";
import {
    mapPexelsPhoto,
    mapPexelsPhotoResponse,
    mapPexelsVideo,
    mapPexelsVideoResponse
} from "./pexelsMapper";
import type {
  MediaItem,
  MediaType,
} from "../types/media";

import type {
  PexelsPhoto,
  PexelsVideo,
} from "../types/pexels";

const DEFAULT_PER_PAGE = 20;
const DEFAULT_CACHE_TTL = 60_000;

export class MediaClient {
    private readonly api: PexelsApiClient;

    private readonly cache: RequestCache;

    private readonly events =
        new EventEmitter<MediaEvents>();

    private readonly pendingRequests =
        new Map<string, Promise<unknown>>();

    constructor(config: MediaClientConfig) {
        this.api = new PexelsApiClient(config);

        this.cache = new RequestCache(
            config.cacheTtl ?? DEFAULT_CACHE_TTL
        );
    }

    async search(
        params: SearchParams
    ): Promise<MediaResult> {
        const query = params.query.trim();

        if (!query) {
            throw new MediaError(
                "Search query cannot be empty.",
                {
                    code: "INVALID_REQUEST",
                }
            );
        }

        const type =
            params.type ?? "photo";

        const page =
            params.page ?? 1;

        const perPage =
            params.perPage ?? DEFAULT_PER_PAGE;

        this.validatePagination(
            page,
            perPage
        );

        const cacheKey =
            `search:${type}:${query}:${page}:${perPage}`;

        return this.request(
            cacheKey,
            async () => {
                if (type === "video") {
                    const response =
                        await this.api.get<
                            import("../types/pexels").PexelsVideoSearchResponse
                        >(
                            "/videos/search",
                            {
                                query,
                                page,
                                per_page: perPage,
                            }
                        );

                    return mapPexelsVideoResponse(
                        response
                    );
                }

                const response =
                    await this.api.get<
                        import("../types/pexels").PexelsPhotoSearchResponse
                    >(
                        "/search",
                        {
                            query,
                            page,
                            per_page: perPage,
                        }
                    );

                return mapPexelsPhotoResponse(
                    response
                );
            }
        );
    }

    async curated(
        params: CuratedParams = {}
    ): Promise<MediaResult> {
        const type =
            params.type ?? "photo";

        const page =
            params.page ?? 1;

        const perPage =
            params.perPage ?? DEFAULT_PER_PAGE;

        this.validatePagination(
            page,
            perPage
        );

        const cacheKey =
            `curated:${type}:${page}:${perPage}`;

        return this.request(
            cacheKey,
            async () => {
                if (type === "video") {
                    const response =
                        await this.api.get<
                            import("../types/pexels").PexelsVideoSearchResponse
                        >(
                            "/videos/popular",
                            {
                                page,
                                per_page: perPage,
                            }
                        );

                    return mapPexelsVideoResponse(
                        response
                    );
                }

                const response =
                    await this.api.get<
                        import("../types/pexels").PexelsPhotoSearchResponse
                    >(
                        "/curated",
                        {
                            page,
                            per_page: perPage,
                        }
                    );

                return mapPexelsPhotoResponse(
                    response
                );
            }
        );
    }

    async getById(
        id: number,
        type: MediaType = "photo"
    ): Promise<MediaItem> {
        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            throw new MediaError(
                "Media ID must be a positive integer.",
                {
                    code: "INVALID_REQUEST",
                }
            );
        }

        const cacheKey =
            `media:${type}:${id}`;

        return this.request(
            cacheKey,
            async () => {
                if (type === "video") {
                    const response =
                        await this.api.get<PexelsVideo>(
                            `/videos/videos/${id}`
                        );

                    return mapPexelsVideo(
                        response
                    );
                }

                const response =
                    await this.api.get<PexelsPhoto>(
                        `/photos/${id}`
                    );

                return mapPexelsPhoto(
                    response
                );
            }
        );
    }

    on<K extends keyof MediaEvents>(
        event: K,
        listener: (
            payload: MediaEvents[K]
        ) => void
    ): () => void {
        return this.events.on(
            event,
            listener
        );
    }

    trackView(
        mediaId: number,
        mediaType: "photo" | "video"
    ): void {
        this.events.emit("view", {
            mediaId,
            mediaType,
            timestamp: Date.now(),
        });
    }

    trackDownload(
        mediaId: number,
        mediaType: "photo" | "video"
    ): void {
        this.events.emit("download", {
            mediaId,
            mediaType,
            timestamp: Date.now(),
        });
    }

    clearCache(): void {
        this.cache.clear();
    }

    removeAllListeners(): void {
        this.events.removeAllListeners();
    }

    private async request<T>(
        cacheKey: string,
        requestFn: () => Promise<T>
    ): Promise<T> {
        const cached =
            this.cache.get<T>(cacheKey);

        if (cached !== undefined) {
            return cached;
        }

        const pending =
            this.pendingRequests.get(
                cacheKey
            );

        if (pending) {
            return pending as Promise<T>;
        }

        const requestPromise =
            requestFn()
                .then((result) => {
                    this.cache.set(
                        cacheKey,
                        result
                    );

                    return result;
                })
                .finally(() => {
                    this.pendingRequests.delete(
                        cacheKey
                    );
                });

        this.pendingRequests.set(
            cacheKey,
            requestPromise
        );

        return requestPromise;
    }

    private validatePagination(
        page: number,
        perPage: number
    ): void {
        if (
            !Number.isInteger(page) ||
            page < 1
        ) {
            throw new MediaError(
                "Page must be a positive integer.",
                {
                    code: "INVALID_REQUEST",
                }
            );
        }

        if (
            !Number.isInteger(perPage) ||
            perPage < 1 ||
            perPage > 80
        ) {
            throw new MediaError(
                "perPage must be between 1 and 80.",
                {
                    code: "INVALID_REQUEST",
                }
            );
        }
    }
}