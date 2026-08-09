import type { MediaItem } from "./media";

export interface Pagination {
  page: number;
  perPage: number;
  totalResults: number;
  hasNextPage: boolean;
}

export interface MediaResult {
  items: MediaItem[];
  pagination: Pagination;
}

export interface SearchParams {
  query: string;
  page?: number;
  perPage?: number;
}

export interface CuratedParams {
  page?: number;
  perPage?: number;
}