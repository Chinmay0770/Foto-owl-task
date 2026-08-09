export interface MediaEvents {
  view: {
    mediaId: number;
    mediaType: "photo" | "video";
    timestamp: number;
  };

  download: {
    mediaId: number;
    mediaType: "photo" | "video";
    timestamp: number;
  };
}