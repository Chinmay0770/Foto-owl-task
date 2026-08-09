import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { MediaSearch } from "./MediaSearch";
import "@testing-library/jest-dom";

import type {
  MediaClient,
  MediaResult,
} from "@headless-media/media-core";
import React from "react";

const mockResult: MediaResult = {
  items: [
    {
      id: 123,
      type: "photo",
      width: 1920,
      height: 1080,
      url: "https://example.com/photo/123",
      photographer: "John Doe",
      photographerUrl:
        "https://example.com/john",
      src: {
        original:
          "https://example.com/photo-original.jpg",
        large:
          "https://example.com/photo-large.jpg",
        medium:
          "https://example.com/photo-medium.jpg",
      },
      alt: "Mountain landscape",
    },
  ],
  pagination: {
    page: 1,
    perPage: 20,
    totalResults: 1,
    hasNextPage: false,
  },
};

function createMockClient() {
  return {
    search: vi.fn(),
    trackView: vi.fn(),
  } as unknown as MediaClient;
}

describe("MediaSearch", () => {
  let client: MediaClient;

  beforeEach(() => {
    vi.clearAllMocks();

    client = createMockClient();
  });

  it("renders the search input and button", () => {
    render(
      <MediaSearch
        client={client}
      />
    );

    expect(
      screen.getByLabelText(
        "Search media"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "button",
        {
          name: "Search",
        }
      )
    ).toBeInTheDocument();
  });

  it("disables search when query is empty", () => {
    render(
      <MediaSearch
        client={client}
      />
    );

    expect(
      screen.getByRole(
        "button",
        {
          name: "Search",
        }
      )
    ).toBeDisabled();
  });

  it("searches when the form is submitted", async () => {
    vi.mocked(
      client.search
    ).mockResolvedValue(
      mockResult
    );

    render(
      <MediaSearch
        client={client}
      />
    );

    const input =
      screen.getByLabelText(
        "Search media"
      );

    fireEvent.change(
      input,
      {
        target: {
          value: "mountains",
        },
      }
    );

    fireEvent.click(
      screen.getByRole(
        "button",
        {
          name: "Search",
        }
      )
    );

    await waitFor(() => {
      expect(
        client.search
      ).toHaveBeenCalledWith({
        query: "mountains",
        type: "photo",
        page: 1,
        perPage: 20,
      });
    });
  });

  it("displays search results", async () => {
    vi.mocked(
      client.search
    ).mockResolvedValue(
      mockResult
    );

    render(
      <MediaSearch
        client={client}
      />
    );

    fireEvent.change(
      screen.getByLabelText(
        "Search media"
      ),
      {
        target: {
          value: "mountains",
        },
      }
    );

    fireEvent.click(
      screen.getByRole(
        "button",
        {
          name: "Search",
        }
      )
    );

    expect(
      await screen.findByAltText(
        "Mountain landscape"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "John Doe"
      )
    ).toBeInTheDocument();
  });

  it("displays an empty state when no results are returned", async () => {
    vi.mocked(
      client.search
    ).mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        perPage: 20,
        totalResults: 0,
        hasNextPage: false,
      },
    });

    render(
      <MediaSearch
        client={client}
      />
    );

    fireEvent.change(
      screen.getByLabelText(
        "Search media"
      ),
      {
        target: {
          value: "something-that-does-not-exist",
        },
      }
    );

    fireEvent.click(
      screen.getByRole(
        "button",
        {
          name: "Search",
        }
      )
    );

    expect(
      await screen.findByText(
        'No media found for "something-that-does-not-exist".'
      )
    ).toBeInTheDocument();
  });

  it("displays an error state when search fails", async () => {
    vi.mocked(
      client.search
    ).mockRejectedValue(
      new Error(
        "Failed to fetch media"
      )
    );

    render(
      <MediaSearch
        client={client}
      />
    );

    fireEvent.change(
      screen.getByLabelText(
        "Search media"
      ),
      {
        target: {
          value: "mountains",
        },
      }
    );

    fireEvent.click(
      screen.getByRole(
        "button",
        {
          name: "Search",
        }
      )
    );

    expect(
      await screen.findByText(
        "Failed to fetch media"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "button",
        {
          name: "Retry",
        }
      )
    ).toBeInTheDocument();
  });

  it("retries the search when Retry is clicked", async () => {
    vi.mocked(
      client.search
    )
      .mockRejectedValueOnce(
        new Error(
          "Temporary failure"
        )
      )
      .mockResolvedValueOnce(
        mockResult
      );

    render(
      <MediaSearch
        client={client}
      />
    );

    fireEvent.change(
      screen.getByLabelText(
        "Search media"
      ),
      {
        target: {
          value: "mountains",
        },
      }
    );

    fireEvent.click(
      screen.getByRole(
        "button",
        {
          name: "Search",
        }
      )
    );

    const retryButton =
      await screen.findByRole(
        "button",
        {
          name: "Retry",
        }
      );

    fireEvent.click(
      retryButton
    );

    await waitFor(() => {
      expect(
        client.search
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByAltText(
        "Mountain landscape"
      )
    ).toBeInTheDocument();
  });

  it("requests the next page", async () => {
    vi.mocked(
      client.search
    )
      .mockResolvedValueOnce(
        {
          ...mockResult,
          pagination: {
            page: 1,
            perPage: 20,
            totalResults: 40,
            hasNextPage: true,
          },
        }
      )
      .mockResolvedValueOnce(
        {
          ...mockResult,
          pagination: {
            page: 2,
            perPage: 20,
            totalResults: 40,
            hasNextPage: false,
          },
        }
      );

    render(
      <MediaSearch
        client={client}
      />
    );

    fireEvent.change(
      screen.getByLabelText(
        "Search media"
      ),
      {
        target: {
          value: "mountains",
        },
      }
    );

    fireEvent.click(
      screen.getByRole(
        "button",
        {
          name: "Search",
        }
      )
    );

    await screen.findByAltText(
      "Mountain landscape"
    );

    fireEvent.click(
      screen.getByRole(
        "button",
        {
          name: "Next",
        }
      )
    );

    await waitFor(() => {
      expect(
        client.search
      ).toHaveBeenLastCalledWith({
        query: "mountains",
        type: "photo",
        page: 2,
        perPage: 20,
      });
    });
  });

  it("tracks a media view when a result is clicked", async () => {
    vi.mocked(
      client.search
    ).mockResolvedValue(
      mockResult
    );

    render(
      <MediaSearch
        client={client}
      />
    );

    fireEvent.change(
      screen.getByLabelText(
        "Search media"
      ),
      {
        target: {
          value: "mountains",
        },
      }
    );

    fireEvent.click(
      screen.getByRole(
        "button",
        {
          name: "Search",
        }
      )
    );

    const image =
      await screen.findByAltText(
        "Mountain landscape"
      );

    fireEvent.click(
      image
    );

    expect(
      client.trackView
    ).toHaveBeenCalledWith(
      123,
      "photo"
    );
  });
});