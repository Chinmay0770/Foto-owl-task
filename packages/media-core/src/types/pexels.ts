export interface PexelsPhotoSource {
  original: string;
  large2x?: string;
  large?: string;
  medium?: string;
  small?: string;
  portrait?: string;
  landscape?: string;
  tiny?: string;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  avg_color?: string;
  src: PexelsPhotoSource;
  alt?: string;
}

export interface PexelsPhotoSearchResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
  prev_page?: string;
}

export interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
  width?: number;
  height?: number;
  fps?: number;
  link: string;
}

export interface PexelsVideoPicture {
  id: number;
  picture: string;
  nr: number;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user?: {
    id: number;
    name: string;
    url: string;
  };
  video_files: PexelsVideoFile[];
  video_pictures: PexelsVideoPicture[];
}

export interface PexelsVideoSearchResponse {
  page: number;
  per_page: number;
  videos: PexelsVideo[];
  total_results: number;
  url: string;
  next_page?: string;
  prev_page?: string;
}