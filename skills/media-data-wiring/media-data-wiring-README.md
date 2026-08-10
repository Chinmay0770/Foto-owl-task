# Media Data Wiring

This document explains how the Headless Media SDK connects the application to the media provider, manages requests, caching, pagination, errors, and exposes media data to React applications.

The data layer is intentionally separated from the UI layer so the same media functionality can be consumed by different interfaces.

---

## Architecture

```text
Application
    ↓
MediaClient
    ↓
PexelsApiClient
    ↓
Pexels API
    ↓
Pexels response
    ↓
Media mapper
    ↓
Normalized MediaItem
    ↓
React hook
    ↓
UI components
```

The main packages are:

- `@headless-media/media-core`
- `@headless-media/media-react`
- `@headless-media/media-ui-react`

---

# Media Core

`@headless-media/media-core` contains the provider-independent media functionality.

## Creating a MediaClient

```ts
import { MediaClient } from "@headless-media/media-core";

const client = new MediaClient({
  apiKey: "YOUR_PEXELS_API_KEY",
});
```

Configuration:

```ts
interface MediaClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheTtl?: number;
}
```

| Property | Required | Description |
|---|---|---|
| `apiKey` | Yes | API key used to authenticate media requests |
| `baseUrl` | No | Base URL used by the API client |
| `timeout` | No | Request timeout |
| `cacheTtl` | No | Cache lifetime in milliseconds |

Example:

```ts
const client = new MediaClient({
  apiKey: import.meta.env.VITE_PEXELS_API_KEY,
  timeout: 10000,
  cacheTtl: 60000,
});
```

---

# Searching Media

```ts
const result = await client.search({
  query: "nature",
  type: "photo",
  page: 1,
  perPage: 20,
});
```

The result contains normalized media items and pagination:

```ts
{
  items: [...],
  pagination: {
    page: 1,
    perPage: 20,
    totalResults: 100,
    hasNextPage: true
  }
}
```

## Photos

```ts
const result = await client.search({
  query: "mountains",
  type: "photo",
  page: 1,
  perPage: 20,
});
```

## Videos

```ts
const result = await client.search({
  query: "ocean",
  type: "video",
  page: 1,
  perPage: 20,
});
```

---

# Pagination

```ts
const result = await client.search({
  query: "nature",
  type: "photo",
  page: 2,
  perPage: 20,
});
```

Use:

```ts
result.pagination.hasNextPage
```

to determine whether another request is available.

The SDK validates pagination values before making requests.

---

# Curated Media

```ts
const photos = await client.curated({
  type: "photo",
  page: 1,
  perPage: 20,
});

const videos = await client.curated({
  type: "video",
  page: 1,
  perPage: 20,
});
```

Provider-specific endpoints remain hidden behind `MediaClient`.

---

# Get Media by ID

```ts
const photo = await client.getById(12345, "photo");

const video = await client.getById(12345, "video");
```

The method validates that the ID is a positive integer.

---

# Normalized Media Model

The SDK maps provider responses into a common representation.

Exported types include:

```ts
MediaItem
MediaType
MediaSource
VideoFile
VideoPicture
```

This prevents the UI from depending directly on provider-specific response objects.

---

# Provider Mapping

Provider responses are processed through mapper functions:

```ts
mapPexelsPhoto()
mapPexelsPhotoResponse()
mapPexelsVideo()
mapPexelsVideoResponse()
```

Flow:

```text
Pexels Response
      ↓
Pexels Mapper
      ↓
MediaItem / MediaResult
      ↓
Application
```

---

# Request Caching

`MediaClient` maintains a request cache.

Search cache keys include:

```text
type
query
page
perPage
```

Example:

```text
search:photo:nature:1:20
```

The default cache TTL is `60_000` milliseconds, or 60 seconds.

Clear the cache with:

```ts
client.clearCache();
```

---

# Request Deduplication

The client also tracks pending requests.

If an identical request is already running, the existing promise can be reused instead of creating another network request.

```text
Request A
   ↓
Network request

Request B
   ↓
Same cache key
   ↓
Reuse Request A
```

---

# Events

The SDK supports media interaction events through:

```ts
client.on(...)
client.trackView(...)
client.trackDownload(...)
```

Example:

```ts
const unsubscribe = client.on("view", (event) => {
  console.log("Media viewed", event);
});

unsubscribe();
```

## Tracking a View

```ts
client.trackView(mediaId, "photo");
client.trackView(mediaId, "video");
```

Events include:

```ts
{
  mediaId,
  mediaType,
  timestamp
}
```

## Tracking a Download

```ts
client.trackDownload(mediaId, "photo");
```

The same mechanism can be used for videos.

---

# Error Handling

The SDK provides `MediaError`.

```ts
try {
  await client.search({
    query: "",
    type: "photo",
  });
} catch (error) {
  if (error instanceof MediaError) {
    console.error(error.message);
  }
}
```

Invalid requests are rejected before unnecessary provider requests are made.

---

# React Data Layer

The React integration is provided by:

```text
@headless-media/media-react
```

The primary API is:

```ts
useMediaSearch()
```

## Installation

```bash
pnpm add @headless-media/media-core
pnpm add @headless-media/media-react
```

## useMediaSearch

```tsx
import { useMediaSearch } from "@headless-media/media-react";

const media = useMediaSearch({
  client,
  initialQuery: "nature",
  type: "photo",
  perPage: 20,
});
```

The hook exposes:

```ts
{
  query,
  type,
  items,
  loading,
  error,
  page,
  hasNextPage,
  search,
  loadMore,
  clear
}
```

---

# Searching

```tsx
await media.search("mountains");
```

The hook updates the query, resets pagination, fetches page one, stores results, updates `hasNextPage`, and manages loading/error state.

---

# Loading More

```tsx
await media.loadMore();
```

New results are appended to the existing collection.

```text
Page 1 → 20 results
Page 2 → 40 results
Page 3 → 60 results
```

The hook prevents loading more when a request is already running, there is no active query, or there is no next page.

---

# Photos and Videos

The hook supports:

```ts
type MediaSearchType =
  | MediaType
  | "both";
```

Photo:

```tsx
useMediaSearch({
  client,
  type: "photo",
});
```

Video:

```tsx
useMediaSearch({
  client,
  type: "video",
});
```

Both:

```tsx
useMediaSearch({
  client,
  type: "both",
});
```

When `both` is selected, photo and video requests are performed together and combined into one media collection.

---

# Clearing Results

```tsx
media.clear();
```

This resets:

```text
query
items
error
page
hasNextPage
```

---

# Recommended Application Flow

```text
App
 │
 ├── MediaClient
 │
 ├── useMediaSearch()
 │       ├── search()
 │       ├── loadMore()
 │       └── clear()
 │
 └── Media UI Components
         ├── MediaSearch
         ├── MediaGrid
         ├── MediaCard
         └── Lightbox / Video Viewer
```

---

# Separation of Responsibilities

### Core

Handles:

- API communication
- validation
- mapping
- caching
- request deduplication
- events
- errors

### React

Handles:

- React state
- search state
- loading state
- pagination state
- error state

### UI

Handles:

- forms
- cards
- grids
- loading states
- empty states
- error states
- media presentation

This allows the core SDK to be reused without requiring React.
