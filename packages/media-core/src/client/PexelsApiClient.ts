import { MediaError } from "../errors/MediaError";
import type { MediaClientConfig } from "../types/config";

const DEFAULT_BASE_URL = "https://api.pexels.com/v1";
const DEFAULT_TIMEOUT = 10_000;

export class PexelsApiClient {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly timeout: number;

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
    }

    async get<T>(
        path: string,
        params?: Record<
            string,
            string | number | boolean | undefined
        >
    ): Promise<T> {
        const url = new URL(
            path.replace(/^\/+/, ""),
            `${this.baseUrl}/`
        );

        if (params) {
            Object.entries(params).forEach(
                ([key, value]) => {
                    if (value !== undefined) {
                        url.searchParams.set(
                            key,
                            String(value)
                        );
                    }
                }
            );
        }

        return this.request<T>(url);
    }

    private async request<T>(
        url: URL
    ): Promise<T> {
        const controller =
            new AbortController();

        const timeoutId = setTimeout(
            () => controller.abort(),
            this.timeout
        );

        try {
            const response = await fetch(
                url.toString(),
                {
                    method: "GET",
                    headers: {
                        Authorization: this.apiKey,
                        Accept: "application/json",
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
                "Failed to communicate with the Pexels API.",
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
                "Invalid Pexels API credentials.",
                {
                    code: "AUTHENTICATION_ERROR",
                    status,
                }
            );
        }

        if (status === 404) {
            return new MediaError(
                "Pexels resource was not found.",
                {
                    code: "NOT_FOUND",
                    status,
                }
            );
        }

        if (status === 429) {
            return new MediaError(
                "Pexels API rate limit exceeded.",
                {
                    code: "RATE_LIMITED",
                    status,
                }
            );
        }

        if (status >= 400 && status < 500) {
            return new MediaError(
                "Invalid Pexels API request.",
                {
                    code: "INVALID_REQUEST",
                    status,
                }
            );
        }

        return new MediaError(
            "Pexels API request failed.",
            {
                code: "API_ERROR",
                status,
            }
        );
    }
}