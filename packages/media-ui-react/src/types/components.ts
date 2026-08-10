export type MediaDisplayType =
  | "photo"
  | "video";

export interface MediaDisplayItem {
  id: number;

  type: MediaDisplayType;

  url: string;

  src?: {
    original?: string;
    large2x?: string;
    large?: string;
    medium?: string;
    small?: string;
    portrait?: string;
    landscape?: string;
    tiny?: string;
  };

  alt?: string;

  photographer?: string;

  photographerUrl?: string;

  duration?: number;

  videoFiles?: Array<{
    id?: number;
    quality?: string;
    fileType?: string;
    width?: number;
    height?: number;
    fps?: number;
    link: string;
  }>;

  videoPictures?: Array<{
    id?: number;
    picture: string;
    nr?: number;
  }>;
}

export type MediaSearchType =
  | "photo"
  | "video"
  | "both";

export interface MediaSearchProps {
  initialQuery?: string;

  type?: MediaSearchType;

  items?: MediaDisplayItem[];

  loading?: boolean;

  error?: unknown;

  hasNextPage?: boolean;

  onSearch?: (
    query: string
  ) => void | Promise<void>;

  onTypeChange?: (
    type: MediaSearchType
  ) => void;

  onLoadMore?: () => void | Promise<void>;

  onMediaClick?: (
    media: MediaDisplayItem
  ) => void;

  className?: string;
}

export interface MediaGridProps {
  items: MediaDisplayItem[];

  columns?: number;

  loading?: boolean;

  hasNextPage?: boolean;

  onLoadMore?: () => void | Promise<void>;

  onMediaClick?: (
    media: MediaDisplayItem
  ) => void;

  className?: string;
}

export interface MediaCardProps {
  media: MediaDisplayItem;

  onClick?: (
    media: MediaDisplayItem
  ) => void;

  className?: string;
}