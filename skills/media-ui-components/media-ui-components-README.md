# Media UI Components

This document describes the reusable React UI components provided by:

```text
@headless-media/media-ui-react
```

The component package provides the presentation layer for searching, displaying, and interacting with media.

The components work with the data provided by `@headless-media/media-react` and `@headless-media/media-core`.

---

# UI Architecture

```text
User
 ↓
MediaSearch
 ↓
Search / Media Type
 ↓
useMediaSearch
 ↓
MediaClient
 ↓
MediaGrid
 ↓
MediaCard
 ↓
Media Viewer
```

The UI package does not own the media API integration. Data and actions are passed into components through props.

---

# Available Components

The package exposes:

```ts
MediaSearch
MediaGrid
MediaCard
LoadingState
ErrorState
EmptyState
```

It also exposes component-related TypeScript types.

---

# Installation

```bash
pnpm add @headless-media/media-ui-react
```

The package supports React 18 and React 19.

---

# MediaSearch

`MediaSearch` is the main search interface.

It provides:

- search input
- search button
- media type selection
- loading state
- error state
- empty state
- media grid
- pagination/load more integration

Example:

```tsx
<MediaSearch
  initialQuery="nature"
  type="photo"
  perPage={20}
/>
```

---

# Connecting MediaSearch to Data

The UI component is presentation-oriented. Search behavior can be connected to the React data hook.

```tsx
const media = useMediaSearch({
  client,
  initialQuery: "nature",
  type: "photo",
  perPage: 20,
});
```

Then:

```tsx
<MediaSearch
  initialQuery={media.query}
  type={media.type}
  items={media.items}
  loading={media.loading}
  error={media.error}
  hasNextPage={media.hasNextPage}
  onSearch={media.search}
  onLoadMore={media.loadMore}
/>
```

This creates the:

```text
Search → API → Results → Grid
```

flow.

---

# Search Form

The component provides a search input and prevents empty searches.

```text
┌─────────────────────────────────────────┐
│ 🔍 nature                     [ Search ] │
└─────────────────────────────────────────┘
```

The search callback receives the query:

```tsx
onSearch={(query) => {
  console.log(query);
}}
```

---

# Media Type Selection

The component supports:

```text
Photos
Videos
Photos & Videos
```

Example:

```tsx
<MediaSearch
  type="photo"
  onTypeChange={(type) => {
    console.log(type);
  }}
/>
```

Supported values:

```ts
"photo"
"video"
"both"
```

---

# MediaGrid

`MediaGrid` displays a collection of media items.

```tsx
<MediaGrid
  items={items}
  loading={loading}
  hasNextPage={hasNextPage}
  onLoadMore={loadMore}
  onMediaClick={handleMediaClick}
/>
```

The grid displays media cards rather than retrieving data itself.

---

# Responsive Grid

The grid is designed to adapt to different screen sizes.

```text
Desktop

┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│      │ │      │ │      │ │      │
└──────┘ └──────┘ └──────┘ └──────┘

Tablet

┌────────┐ ┌────────┐
│        │ │        │
└────────┘ └────────┘

Mobile

┌────────────────┐
│                │
└────────────────┘
```

---

# MediaCard

`MediaCard` represents an individual media item.

It can display:

- image preview
- video preview
- media metadata
- interaction affordances

Example:

```tsx
<MediaCard
  media={item}
  onClick={handleMediaClick}
/>
```

Cards can also be rendered independently of `MediaSearch`.

---

# Clicking a Media Item

The grid exposes:

```tsx
onMediaClick
```

Example:

```tsx
const handleMediaClick = (
  media: MediaDisplayItem
) => {
  setSelectedMedia(media);
};
```

Typical flow:

```text
MediaCard
    ↓
onMediaClick
    ↓
selectedMedia
    ↓
Lightbox / Viewer
```

---

# Lightbox

The web application uses a media viewer for selected media.

Interaction:

```text
Grid
 ↓
User clicks media
 ↓
Selected media
 ↓
Lightbox opens
```

The viewer can provide:

- previous item
- next item
- close action
- media preview
- media metadata
- author information

Example layout:

```text
┌───────────────────────────────────────────────┐
│                                               │
│  ‹                MEDIA                ›      │
│                                               │
│             Media preview                    │
│                                               │
│  PHOTO                         Photo by ...   │
│  Description                                  │
└───────────────────────────────────────────────┘
```

---

# Photo Viewer

For photo results, the viewer displays the selected image.

The selected item remains part of the current result set, allowing navigation through results.

```text
Grid
 ↓
Photo 5
 ↓
Lightbox
 ↓
← Photo 4
Photo 5
Photo 6 →
```

---

# Video Results

Video results use the same search and grid infrastructure.

Select:

```text
Videos
```

The data layer requests video media, while the UI presents video thumbnails in the grid.

Selecting a video opens the video viewing experience.

---

# Video Reels View

The web application provides a reels-style experience for video results.

```text
Videos
 ↓
Select video
 ↓
Reels-style viewer
 ↓
Current video
 ↓
Previous / Next
```

Conceptually:

```text
┌──────────────────────┐
│                      │
│                      │
│       VIDEO          │
│                      │
│                      │
│              ↑       │
│              ↓       │
└──────────────────────┘
```

The viewer is centered around the video itself rather than presenting it as a traditional photo lightbox.

---

# Photos & Videos

The search interface supports:

```text
Photos & Videos
```

The data layer performs both searches and combines the results.

```text
Photos ──────┐
             ├──→ Combined results → MediaGrid
Videos ──────┘
```

Each item retains its media type so the application can route it appropriately:

```text
Photo → Lightbox
Video → Reels viewer
```

---

# LoadingState

`LoadingState` is displayed while media is being retrieved.

```tsx
{loading && <LoadingState />}
```

It can also be used independently with custom data fetching.

---

# ErrorState

`ErrorState` provides reusable error presentation.

```tsx
<ErrorState
  error="Unable to load media."
  onRetry={handleRetry}
/>
```

The retry callback allows the application to repeat the failed operation.

---

# EmptyState

`EmptyState` is displayed when a search completes without results.

```text
No media found

Try searching for another keyword.
```

The component can receive the current query to provide more useful feedback.

---

# Pagination / Load More

The grid supports loading additional results.

```tsx
<MediaGrid
  items={items}
  hasNextPage={hasNextPage}
  onLoadMore={loadMore}
/>
```

Flow:

```text
Page 1
 ↓
20 results

Load more
 ↓

Page 2
 ↓
40 results
```

The React data hook manages page numbers and appends new results.

---

# Complete Example

```tsx
import { useMemo } from "react";

import {
  MediaClient,
} from "@headless-media/media-core";

import {
  useMediaSearch,
} from "@headless-media/media-react";

import {
  MediaSearch,
} from "@headless-media/media-ui-react";

function MediaExplorer() {
  const client = useMemo(
    () =>
      new MediaClient({
        apiKey:
          import.meta.env.VITE_PEXELS_API_KEY,
      }),
    []
  );

  const media = useMediaSearch({
    client,
    initialQuery: "nature",
    type: "photo",
    perPage: 20,
  });

  return (
    <MediaSearch
      initialQuery={media.query}
      type={media.type}
      items={media.items}
      loading={media.loading}
      error={media.error}
      hasNextPage={media.hasNextPage}
      onSearch={media.search}
      onLoadMore={media.loadMore}
    />
  );
}

export default MediaExplorer;
```

---

# Component Responsibilities

| Component | Responsibility |
|---|---|
| `MediaSearch` | Search interface and overall media search presentation |
| `MediaGrid` | Collection/grid layout |
| `MediaCard` | Individual media presentation |
| `LoadingState` | Loading UI |
| `ErrorState` | Error UI and retry |
| `EmptyState` | No-result UI |

The components do not need to know how the external media provider works.

---

# Separation of Concerns

```text
Data
 │
 └── @headless-media/media-core

React State
 │
 └── @headless-media/media-react

UI
 │
 └── @headless-media/media-ui-react
```

This makes the components reusable. The UI layer can receive media data from another source as long as it conforms to the expected component types.

---

# End-to-End Example

```text
User enters "nature"
        ↓
MediaSearch
        ↓
onSearch("nature")
        ↓
useMediaSearch
        ↓
MediaClient.search()
        ↓
Pexels API
        ↓
Pexels mapper
        ↓
MediaItem[]
        ↓
MediaGrid
        ↓
MediaCard[]
        ↓
User selects item
        ↓
Selected media
        ↓
┌───────────────────────┐
│ Photo → Lightbox      │
│ Video → Reels View    │
└───────────────────────┘
```

---

# Design Goals

### Reusable

Components can be used independently or together.

### Headless-friendly

Data fetching is separated from presentation.

### Provider-independent UI

Components consume normalized media objects instead of provider-specific responses.

### Type-safe

The components expose TypeScript interfaces for their props and media types.

### React 18 / React 19 compatible

The package is designed to work with modern React applications.

---

# Summary

The Media UI package provides the presentation layer for the Headless Media SDK.

It handles:

- media search UI
- media type selection
- responsive media grids
- media cards
- loading states
- error states
- empty states
- pagination
- photo viewing
- video viewing
- reels-style video presentation

Overall architecture:

```text
@headless-media/media-core
            ↓
@headless-media/media-react
            ↓
@headless-media/media-ui-react
            ↓
        Application
```
