import type {
  MediaItem,
} from "../types/media";

import type {
  MediaResult,
} from "../types/api";

import type {
  PexelsPhoto,
  PexelsPhotoSearchResponse,
  PexelsVideo,
  PexelsVideoSearchResponse,
} from "../types/pexels";

export function mapPexelsPhoto(
  photo: PexelsPhoto
): MediaItem {
  return {
    id: photo.id,
    type: "photo",
    width: photo.width,
    height: photo.height,
    url: photo.url,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    avgColor: photo.avg_color,
    alt: photo.alt,
    src: {
      original: photo.src.original,
      large: photo.src.large,
      medium: photo.src.medium,
      small: photo.src.small,
      portrait: photo.src.portrait,
      landscape: photo.src.landscape,
      tiny: photo.src.tiny,
    },
  };
}

export function mapPexelsPhotoResponse(
  response: PexelsPhotoSearchResponse
): MediaResult {
  return {
    items: response.photos.map(mapPexelsPhoto),
    pagination: {
      page: response.page,
      perPage: response.per_page,
      totalResults: response.total_results,
      hasNextPage: Boolean(response.next_page),
    },
  };
}

export function mapPexelsVideo(
  video: PexelsVideo
): MediaItem {
  return {
    id: video.id,
    type: "video",
    width: video.width,
    height: video.height,
    url: video.url,

    photographer:
      video.user?.name,

    photographerUrl:
      video.user?.url,

    duration:
      video.duration,

    src: {
      original: video.image,
    },

    videoFiles:
      video.video_files.map(
        (file) => ({
          id: file.id,
          quality: file.quality,
          fileType: file.file_type,
          width: file.width,
          height: file.height,
          fps: file.fps,
          link: file.link,
        })
      ),

    videoPictures:
      video.video_pictures.map(
        (picture) => ({
          id: picture.id,
          picture: picture.picture,
          nr: picture.nr,
        })
      ),
  };
}

export function mapPexelsVideoResponse(
  response: PexelsVideoSearchResponse
): MediaResult {
  return {
    items: response.videos.map(
      mapPexelsVideo
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