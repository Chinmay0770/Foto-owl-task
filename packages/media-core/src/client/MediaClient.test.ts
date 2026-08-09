import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { MediaClient } from "./MediaClient";
import { MediaError } from "../errors/MediaError";

const photoResponse = {
  id: 123,
  width: 1920,
  height: 1080,
  url: "https://example.com/photo",
  photographer: "Test Photographer",
  photographer_url:
    "https://example.com/photographer",
  avg_color: "#ffffff",
  alt: "Test photo",
  src: {
    original:
      "https://example.com/original.jpg",
    large:
      "https://example.com/large.jpg",
    medium:
      "https://example.com/medium.jpg",
    small:
      "https://example.com/small.jpg",
    portrait:
      "https://example.com/portrait.jpg",
    landscape:
      "https://example.com/landscape.jpg",
    tiny:
      "https://example.com/tiny.jpg",
  },
};

const searchResponse = {
  page: 1,
  per_page: 20,
  photos: [photoResponse],
  total_results: 1,
  next_page:
    "https://api.pexels.com/v1/search?query=test&page=2",
};

const videoResponse = {
  id: 456,
  width: 1920,
  height: 1080,
  url: "https://example.com/video",
  image: "https://example.com/video.jpg",
  duration: 10,
  user: {
    id: 1,
    name: "Video Creator",
    url: "https://example.com/user",
  },
  video_files: [
    {
      id: 1,
      quality: "hd",
      file_type: "video/mp4",
      width: 1920,
      height: 1080,
      fps: 30,
      link: "https://example.com/video.mp4",
    },
  ],
  video_pictures: [],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MediaClient", () => {
  it("searches for photos", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify(searchResponse),
          {
            status: 200,
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        )
      );

    const client = new MediaClient({
      apiKey: "test-key",
    });

    const result =
      await client.search({
        query: "mountains",
      });

    expect(result.items).toHaveLength(1);

    expect(result.items[0]).toMatchObject({
      id: 123,
      type: "photo",
      photographer:
        "Test Photographer",
    });

    expect(
      result.pagination
    ).toMatchObject({
      page: 1,
      perPage: 20,
      totalResults: 1,
      hasNextPage: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects an empty search query", async () => {
    const client = new MediaClient({
      apiKey: "test-key",
    });

    await expect(
      client.search({
        query: "   ",
      })
    ).rejects.toMatchObject({
      code: "INVALID_REQUEST",
    });
  });

  it("retrieves a single photo", async () => {
    vi.spyOn(
      globalThis,
      "fetch"
    ).mockResolvedValue(
      new Response(
        JSON.stringify(photoResponse),
        {
          status: 200,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      )
    );

    const client = new MediaClient({
      apiKey: "test-key",
    });

    const result =
      await client.getById(123);

    expect(result).toMatchObject({
      id: 123,
      type: "photo",
      photographer:
        "Test Photographer",
    });
  });

  it("deduplicates concurrent requests", async () => {
    let resolveRequest:
      | ((response: Response) => void)
      | undefined;

    const requestPromise =
      new Promise<Response>((resolve) => {
        resolveRequest = resolve;
      });

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValue(
        requestPromise
      );

    const client = new MediaClient({
      apiKey: "test-key",
    });

    const first =
      client.search({
        query: "cats",
      });

    const second =
      client.search({
        query: "cats",
      });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveRequest!(
      new Response(
        JSON.stringify(searchResponse),
        {
          status: 200,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      )
    );

    const [firstResult, secondResult] =
      await Promise.all([
        first,
        second,
      ]);

    expect(firstResult).toEqual(
      secondResult
    );

    expect(fetchMock).toHaveBeenCalledTimes(
      1
    );
  });

  it("emits view events", () => {
    const client = new MediaClient({
      apiKey: "test-key",
    });

    const listener = vi.fn();

    client.on(
      "view",
      listener
    );

    client.trackView(
      123,
      "photo"
    );

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaId: 123,
        mediaType: "photo",
      })
    );
  });

  it("supports event unsubscribe", () => {
    const client = new MediaClient({
      apiKey: "test-key",
    });

    const listener = vi.fn();

    const unsubscribe =
      client.on(
        "view",
        listener
      );

    unsubscribe();

    client.trackView(
      123,
      "photo"
    );

    expect(listener).not.toHaveBeenCalled();
  });

  it("uses cached results", async () => {
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(
        JSON.stringify(
          searchResponse
        ),
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
    new MediaClient({
      apiKey: "test-key",
    });

  await client.search({
    query: "cats",
  });

  await client.search({
    query: "cats",
  });

  expect(
    fetchMock
  ).toHaveBeenCalledTimes(1);
});

it("retrieves a video", async () => {
  vi.spyOn(
    globalThis,
    "fetch"
  ).mockResolvedValue(
    new Response(
      JSON.stringify(
        videoResponse
      ),
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
    new MediaClient({
      apiKey: "test-key",
    });

  const result =
    await client.getById(
      456,
      "video"
    );

  expect(result).toMatchObject({
    id: 456,
    type: "video",
    duration: 10,
  });

  expect(
    result.videoFiles
  ).toHaveLength(1);
});

it("searches videos", async () => {
  vi.spyOn(
    globalThis,
    "fetch"
  ).mockResolvedValue(
    new Response(
      JSON.stringify({
        page: 1,
        per_page: 20,
        videos: [
          videoResponse,
        ],
        total_results: 1,
        url: "https://example.com",
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
    new MediaClient({
      apiKey: "test-key",
    });

  const result =
    await client.search({
      query: "ocean",
      type: "video",
    });

  expect(
    result.items[0]
  ).toMatchObject({
    id: 456,
    type: "video",
  });
});
});