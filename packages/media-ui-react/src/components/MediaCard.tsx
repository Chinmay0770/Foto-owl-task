import React from "react";
import type { MediaCardProps } from "../types/components";

export function MediaCard({
  media,
  onClick,
  onDownload,
  className = "",
}: MediaCardProps) {
  const handleClick =
    () => {
      onClick?.(media);
    };

  const handleDownload =
    (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      event.stopPropagation();

      onDownload?.(media);
    };

  return (
    <article
      className={`media-card ${className}`}
      onClick={handleClick}
    >
      <div className="media-card__media">
        {media.type ===
        "video" ? (
          <video
            src={
              media.videoFiles?.[0]
                ?.link
            }
            poster={
              media.src?.original
            }
            controls
            preload="metadata"
          />
        ) : (
          <img
            src={
              media.src?.large ??
              media.src?.medium ??
              media.url
            }
            alt={
              media.alt ??
              `Photo by ${
                media.photographer ??
                "Unknown"
              }`
            }
            loading="lazy"
          />
        )}
      </div>

      <div className="media-card__content">
        <p className="media-card__author">
          {media.photographer ??
            "Unknown creator"}
        </p>

        {media.type ===
          "video" &&
          media.duration !==
            undefined && (
            <span>
              {media.duration}s
            </span>
          )}

        {onDownload && (
          <button
            type="button"
            onClick={
              handleDownload
            }
          >
            Download
          </button>
        )}
      </div>
    </article>
  );
}