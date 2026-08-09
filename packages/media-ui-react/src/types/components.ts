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

  className?: string;
}

export interface MediaGridProps {
  items: MediaItem[];

  columns?: number;

  onMediaClick?: (
    media: MediaItem
  ) => void;

  className?: string;
}

export interface MediaCardProps {
  media: MediaItem;

  onClick?: (
    media: MediaItem
  ) => void;

  onDownload?: (
    media: MediaItem
  ) => void;

  className?: string;
}