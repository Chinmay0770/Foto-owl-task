import React from "react";
import type {
  MediaCardProps,
} from "../types/components";

export function MediaCard({
  media,
  onClick,
  className = "",
}: MediaCardProps) {
  const imageSrc =
    media.type === "video"
      ? media.videoPictures?.[0]
          ?.picture ??
        media.src?.large ??
        media.src?.medium ??
        media.url
      : media.src?.large ??
        media.src?.medium ??
        media.src?.original ??
        media.url;

  return (
    <article
      className={`media-card ${className}`}
    >
      <button
        type="button"
        className="media-card__button"
        onClick={() =>
          onClick?.(media)
        }
      >
        <div className="media-card__media">
          <img
            src={imageSrc}
            alt={
              media.alt ??
              `Media by ${
                media.photographer ??
                "Unknown creator"
              }`
            }
            loading="lazy"
          />

          {media.type === "video" && (
            <span
              className="media-card__play"
              aria-hidden="true"
            >
              ▶
            </span>
          )}
        </div>

        <div className="media-card__content">
          <p>
            {media.photographer ??
              "Unknown creator"}
          </p>

          {media.type === "video" &&
            media.duration !==
              undefined && (
              <span>
                {media.duration}s
              </span>
            )}
        </div>
      </button>
    </article>
  );
}