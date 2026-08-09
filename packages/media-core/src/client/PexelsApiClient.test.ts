import { describe, expect, it, vi } from "vitest";

import { PexelsApiClient } from "./PexelsApiClient";
import { MediaError } from "../errors/MediaError";

describe("PexelsApiClient", () => {
  it("adds authentication headers", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            photos: [],
          }),
          {
            status: 200,
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        )
      );

    const client =
      new PexelsApiClient({
        apiKey: "test-api-key",
      });

    await client.get("search", {
      query: "mountains",
      page: 1,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] =
      fetchMock.mock.calls[0];

    expect(url).toBe(
      "https://api.pexels.com/v1/search?query=mountains&page=1"
    );

    expect(options).toMatchObject({
      method: "GET",
      headers: {
        Authorization:
          "test-api-key",
        Accept: "application/json",
      },
    });

    fetchMock.mockRestore();
  });

  it("throws an authentication error for 401", async () => {
    vi.spyOn(
      globalThis,
      "fetch"
    ).mockResolvedValue(
      new Response(null, {
        status: 401,
      })
    );

    const client =
      new PexelsApiClient({
        apiKey: "invalid-key",
      });

    await expect(
      client.get("search", {
        query: "test",
      })
    ).rejects.toMatchObject({
      code: "AUTHENTICATION_ERROR",
      status: 401,
    });
  });

  it("throws a rate limit error for 429", async () => {
    vi.spyOn(
      globalThis,
      "fetch"
    ).mockResolvedValue(
      new Response(null, {
        status: 429,
      })
    );

    const client =
      new PexelsApiClient({
        apiKey: "test-key",
      });

    await expect(
      client.get("search")
    ).rejects.toBeInstanceOf(
      MediaError
    );
  });
});