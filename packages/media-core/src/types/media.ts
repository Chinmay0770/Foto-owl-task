export type MediaType = "photo" | "video";

export interface MediaSource {
  original?: string;
  large2x?: string;
  large?: string;
  medium?: string;
  small?: string;
  portrait?: string;
  landscape?: string;
  tiny?: string;
}

export interface VideoFile {
  id?: number;
  quality?: string;
  fileType?: string;
  width?: number;
  height?: number;
  fps?: number;
  link: string;
}

export interface VideoPicture {
  id?: number;
  picture: string;
  nr?: number;
}

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

  src?: MediaSource;

  duration?: number;

  videoFiles?: VideoFile[];

  videoPictures?: VideoPicture[];
}