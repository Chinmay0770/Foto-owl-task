export type MediaType = "photo" | "video";

export interface MediaItem {
  id: number;
  type: MediaType;
  width: number;
  height: number;
  url: string;
  photographer?: string;
  photographerUrl?: string;
  avgColor?: string;
  alt?: string;
  src?: {
    original?: string;
    large?: string;
    medium?: string;
    small?: string;
    portrait?: string;
    landscape?: string;
    tiny?: string;
  };
  video?: {
    duration?: number;
    width?: number;
    height?: number;
    files: Array<{
      id?: number;
      quality?: string;
      fileType?: string;
      width?: number;
      height?: number;
      fps?: number;
      link: string;
    }>;
    pictures?: Array<{
      id?: number;
      picture: string;
      nr?: number;
    }>;
  };
}