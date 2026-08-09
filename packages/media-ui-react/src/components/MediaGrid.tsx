import React from "react";
import type { MediaGridProps } from "../types/components";
import { MediaCard } from "./MediaCard";

export function MediaGrid({
  items,
  columns = 4,
  onMediaClick,
  className = "",
}: MediaGridProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={`media-grid ${className}`}
      style={{
        gridTemplateColumns:
          `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {items.map(
        (media) => (
          <MediaCard
            key={`${media.type}-${media.id}`}
            media={media}
            onClick={
              onMediaClick
            }
          />
        )
      )}
    </div>
  );
}