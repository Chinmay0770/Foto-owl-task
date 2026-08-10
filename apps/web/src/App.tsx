import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MediaClient,
} from "@headless-media/media-core";

import type {
  MediaItem,
} from "@headless-media/media-core";

import {
  MediaGrid,
} from "@headless-media/media-ui-react";

import {
  useMediaSearch,
} from "@headless-media/media-react";

import type {
  MediaSearchType,
} from "@headless-media/media-react";

import type {
  MediaDisplayItem,
} from "@headless-media/media-ui-react";

import "./App.css";

type LightboxItem = MediaItem;

function getMediaType(
  item: LightboxItem
): "photo" | "video" {
  return item.type;
}

function getImageUrl(
  item: LightboxItem
): string {
  if (item.type === "video") {
    return item.videoPictures?.[0]?.picture ??
      item.src?.original ??
      "";
  }

  return item.src?.large2x ??
    item.src?.large ??
    item.src?.original ??
    item.src?.medium ??
    "";
}

function getVideoUrl(
  item: LightboxItem
): string {
  const files = item.videoFiles ?? [];

  return files.find(
    (file) =>
      file.fileType === "video/mp4" &&
      file.quality === "hd"
  )?.link ?? files.find(
    (file) => file.fileType === "video/mp4"
  )?.link ?? files[0]?.link ?? "";
}

function getTitle(
  item: LightboxItem
): string {
  return item.alt ?? "";
}

function getAuthor(
  item: LightboxItem
): string {
  return item.photographer ?? "";
}

function App() {
  const client = useMemo(() => {
    const apiKey =
      import.meta.env
        .VITE_PEXELS_API_KEY;

    if (!apiKey) {
      throw new Error(
        "VITE_PEXELS_API_KEY is not configured."
      );
    }

    return new MediaClient({
      apiKey,
    });
  }, []);

  const [searchType, setSearchType] =
    useState<MediaSearchType>("photo");

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const media = useMediaSearch({
    client,
    initialQuery: "nature",
    type: searchType,
    perPage: 20,
  });

  /*
   * Automatically perform the initial search.
   */
  useEffect(() => {
    void media.search("nature");
    // We intentionally only want the initial search here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Search with the currently selected type.
   *
   * Because the current useMediaSearch implementation keeps
   * its own type state, we use a small workaround:
   *
   * - photo/video work directly through the current hook
   * - for switching type, the page reloads the hook by using
   *   the browser URL query state.
   *
   * Instead of doing that, we can directly use a local
   * MediaClient search here and keep everything in App.
   */

  const [webItems, setWebItems] =
    useState<MediaItem[]>([]);

  const [webLoading, setWebLoading] =
    useState(false);

  const [webError, setWebError] =
    useState<unknown>(null);

  const [webPage, setWebPage] =
    useState(1);

  const [webHasNextPage, setWebHasNextPage] =
    useState(false);

  const [query, setQuery] =
    useState("nature");

  const performSearch = async (
    value: string,
    type: MediaSearchType,
    page = 1,
    append = false
  ) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setWebItems([]);
      setWebError(null);
      setWebPage(1);
      setWebHasNextPage(false);
      return;
    }

    setWebLoading(true);
    setWebError(null);

    try {
      if (type === "both") {
        const [
          photos,
          videos,
        ] = await Promise.all([
          client.search({
            query: trimmed,
            type: "photo",
            page,
            perPage: 20,
          }),

          client.search({
            query: trimmed,
            type: "video",
            page,
            perPage: 20,
          }),
        ]);

        /*
         * Keep the results balanced instead of putting
         * all photos followed by all videos.
         */
        const mixed: MediaItem[] = [];

        const maxLength =
          Math.max(
            photos.items.length,
            videos.items.length
          );

        for (
          let index = 0;
          index < maxLength;
          index++
        ) {
          if (photos.items[index]) {
            mixed.push(
              photos.items[index]
            );
          }

          if (videos.items[index]) {
            mixed.push(
              videos.items[index]
            );
          }
        }

        setWebItems((previous) =>
          append
            ? [...previous, ...mixed]
            : mixed
        );

        setWebPage(page);

        setWebHasNextPage(
          photos.pagination.hasNextPage ||
          videos.pagination.hasNextPage
        );

        return;
      }

      const result =
        await client.search({
          query: trimmed,
          type,
          page,
          perPage: 20,
        });

      setWebItems((previous) =>
        append
          ? [...previous, ...result.items]
          : result.items
      );

      setWebPage(page);

      setWebHasNextPage(
        result.pagination.hasNextPage
      );
    } catch (error) {
      setWebError(error);

      if (!append) {
        setWebItems([]);
      }

      setWebHasNextPage(false);
    } finally {
      setWebLoading(false);
    }
  };

  const handleSearch = async (
    value: string
  ) => {
    setQuery(value);
    setSelectedIndex(null);

    await performSearch(
      value,
      searchType,
      1,
      false
    );
  };

  const handleTypeChangeDirect = async (
    nextType: MediaSearchType
  ) => {
    setSearchType(nextType);
    setSelectedIndex(null);

    await performSearch(
      query,
      nextType,
      1,
      false
    );
  };

  const handleLoadMore =
    async () => {
      if (
        webLoading ||
        !webHasNextPage
      ) {
        return;
      }

      await performSearch(
        query,
        searchType,
        webPage + 1,
        true
      );
    };

  const handleMediaClick = (
    mediaItem: MediaDisplayItem
  ) => {
    /*
     * Find the corresponding item in the original
     * MediaItem array.
     *
     * MediaDisplayItem and MediaItem have different
     * TypeScript shapes, so compare by id instead of
     * treating one as the other.
     */
    const display = mediaItem as LightboxItem;

    const id =
      (display as { id?: number | string })
        .id;

    const index =
      webItems.findIndex(
        (item) =>
          String(item.id) ===
          String(id)
      );

    if (index >= 0) {
      setSelectedIndex(index);
    }
  };

  const selectedItem =
    selectedIndex !== null
      ? webItems[selectedIndex] ?? null
      : null;

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const showPrevious = useCallback(() => {
    if (
      selectedIndex === null ||
      webItems.length === 0
    ) {
      return;
    }

    setSelectedIndex(
      selectedIndex <= 0
        ? webItems.length - 1
        : selectedIndex - 1
    );
  }, [selectedIndex, webItems.length]);

  const showNext = useCallback(() => {
    if (
      selectedIndex === null ||
      webItems.length === 0
    ) {
      return;
    }

    setSelectedIndex(
      selectedIndex >=
        webItems.length - 1
        ? 0
        : selectedIndex + 1
    );
  }, [selectedIndex, webItems.length]);

  /*
   * Keyboard controls for the lightbox.
   */
  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [closeLightbox, selectedIndex, showNext, showPrevious]);
  
  return (
    <main className="app">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">
            Headless Media SDK
          </p>

          <h1>
            Search. Discover.
            <br />
            Experience media.
          </h1>

          <p className="description">
            Search photos and videos powered
            by Pexels through a reusable
            headless media SDK.
          </p>
        </div>
      </header>

      <section className="search-section">
        <div className="search-shell">
          <div className="search-input-row">
            <div className="search-input-wrapper">
              <span className="search-icon">
                ⌕
              </span>

              <input
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    void handleSearch(
                      query
                    );
                  }
                }}
                placeholder="Search photos and videos..."
                aria-label="Search media"
              />

              {query && (
                <button
                  className="clear-search"
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setWebItems([]);
                    setSelectedIndex(null);
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <button
              className="search-button"
              type="button"
              disabled={
                webLoading ||
                !query.trim()
              }
              onClick={() =>
                void handleSearch(
                  query
                )
              }
            >
              {webLoading
                ? "Searching..."
                : "Search"}
            </button>
          </div>

          <div className="toolbar">
            <div className="type-tabs">
              <button
                type="button"
                className={
                  searchType === "photo"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  void handleTypeChangeDirect(
                    "photo"
                  )
                }
              >
                Photos
              </button>

              <button
                type="button"
                className={
                  searchType === "video"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  void handleTypeChangeDirect(
                    "video"
                  )
                }
              >
                Videos
              </button>

              <button
                type="button"
                className={
                  searchType === "both"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  void handleTypeChangeDirect(
                    "both"
                  )
                }
              >
                Photos & Videos
              </button>
            </div>

            {webItems.length > 0 && (
              <div className="result-count">
                <span />
                {webItems.length} results
              </div>
            )}
          </div>
        </div>

        {webLoading &&
          webItems.length === 0 && (
            <div className="loading-grid">
              {Array.from({
                length: 12,
              }).map((_, index) => (
                <div
                  className="skeleton-card"
                  key={index}
                />
              ))}
            </div>
          )}

        {!webLoading && webError !== null && (
          <div>
            <h3>Something went wrong</h3>

            <p>
              {webError instanceof Error
                ? webError.message
                : "Unable to load media."}
            </p>

            <button
              type="button"
              onClick={() => void handleSearch(query)}
            >
              Try again
            </button>
          </div>
        )}

        {!webLoading &&
          !webError &&
          webItems.length === 0 &&
          query.trim() && (
            <div className="empty-results">
              <div>⌕</div>
              <h3>
                No media found
              </h3>
              <p>
                Try searching for
                something else.
              </p>
            </div>
          )}

        {webItems.length > 0 && (
          <>
            <div className="media-grid-wrapper">
              <MediaGrid
                items={webItems}
                loading={webLoading}
                hasNextPage={
                  webHasNextPage
                }
                onLoadMore={
                  handleLoadMore
                }
                onMediaClick={
                  handleMediaClick
                }
              />
            </div>
          </>
        )}
      </section>

      {selectedItem && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeLightbox();
            }
          }}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close viewer"
          >
            ×
          </button>

          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-left"
            onClick={showPrevious}
            aria-label="Previous media"
          >
            ‹
          </button>

          <div className="lightbox-content">
            <div className="lightbox-media">
              {getMediaType(
                selectedItem
              ) === "video" ? (
                <video
                  key={String(
                    selectedItem.id
                  )}
                  className="lightbox-video"
                  src={getVideoUrl(
                    selectedItem
                  )}
                  poster={getImageUrl(
                    selectedItem
                  )}
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  className="lightbox-image"
                  src={getImageUrl(
                    selectedItem
                  )}
                  alt={getTitle(
                    selectedItem
                  )}
                />
              )}
            </div>

            <div className="lightbox-info">
              <div className="lightbox-type">
                {getMediaType(
                  selectedItem
                ) === "video"
                  ? "VIDEO"
                  : "PHOTO"}
              </div>

              <h2>
                {getTitle(
                  selectedItem
                ) || "Media preview"}
              </h2>

              {getAuthor(
                selectedItem
              ) && (
                  <p>
                    {getMediaType(
                      selectedItem
                    ) === "video"
                      ? "Video by "
                      : "Photo by "}
                    <strong>
                      {getAuthor(
                        selectedItem
                      )}
                    </strong>
                  </p>
                )}
            </div>
          </div>

          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-right"
            onClick={showNext}
            aria-label="Next media"
          >
            ›
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
