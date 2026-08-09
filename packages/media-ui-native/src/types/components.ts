import type {
  MediaClient,
  MediaItem,
  MediaResult,
  MediaType,
} from "@headless-media/media-core";

export interface MediaSearchProps {
  client: MediaClient;

  initialQuery?: string;

  type?: MediaType;

  perPage?: number;

  onResults?: (
    result: MediaResult
  ) => void;

  onError?: (
    error: unknown
  ) => void;
}

export interface MediaGridProps {
  items: MediaItem[];

  numColumns?: number;

  onMediaPress?: (
    media: MediaItem
  ) => void;
}

export interface MediaCardProps {
  media: MediaItem;

  onPress?: (
    media: MediaItem
  ) => void;
}