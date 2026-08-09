import type { MediaItem, MediaType } from "./media";

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
  type?: MediaType;
  page?: number;
  perPage?: number;
}

export interface CuratedParams {
  type?: MediaType;
  page?: number;
  perPage?: number;
}

export interface GetByIdParams {
  id: number;
  type: MediaType;
}