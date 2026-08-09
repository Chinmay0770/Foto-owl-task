import type {
  MediaItem,
} from "../types/media";

import type {
  MediaResult,
} from "../types/api";

import type {
  PexelsPhotoSearchResponse,
} from "../types/pexels";

export function mapPexelsPhotoResponse(
  response: PexelsPhotoSearchResponse
): MediaResult {
  return {
    items: response.photos.map(
      (photo): MediaItem => ({
        id: photo.id,
        type: "photo",
        width: photo.width,
        height: photo.height,
        url: photo.url,
        photographer:
          photo.photographer,
        photographerUrl:
          photo.photographer_url,
        avgColor:
          photo.avg_color,
        alt: photo.alt,
        src: {
          original:
            photo.src.original,
          large:
            photo.src.large,
          medium:
            photo.src.medium,
          small:
            photo.src.small,
          portrait:
            photo.src.portrait,
          landscape:
            photo.src.landscape,
          tiny:
            photo.src.tiny,
        },
      })
    ),

    pagination: {
      page: response.page,
      perPage: response.per_page,
      totalResults:
        response.total_results,
      hasNextPage:
        Boolean(response.next_page),
    },
  };
}