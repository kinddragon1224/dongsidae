import type { HistoricalVisualAsset } from "@/lib/visuals/types";
import { cn } from "@/lib/utils";

type Props = {
  asset: HistoricalVisualAsset;
  className?: string;
  imgClassName?: string;
  showCaption?: boolean;
  parallax?: { x: number; y: number };
  priority?: boolean;
};

export function ArchiveImage({
  asset,
  className,
  imgClassName,
  showCaption = true,
  parallax,
  priority,
}: Props) {
  const pos = asset.focalPoint
    ? `${asset.focalPoint.x * 100}% ${asset.focalPoint.y * 100}%`
    : "50% 40%";

  return (
    <figure className={cn("archive-frame relative", className)}>
      <div className="relative overflow-hidden">
        <img
          src={asset.src}
          alt={asset.alt}
          width={1200}
          height={800}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "low"}
          draggable={false}
          className={cn("archive-photo", imgClassName)}
          style={{
            objectPosition: pos,
            transform: parallax
              ? `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.08)`
              : undefined,
          }}
        />
        <span aria-hidden className="archive-photo-veil" />
      </div>
      {showCaption && (
        <figcaption className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-0.5">
          <span className="text-xs tracking-wide text-subtle">
            {asset.reconstruction ? "재구성" : "사료"}
          </span>
          <span className="min-w-0 text-xs leading-relaxed text-muted-foreground">
            {asset.caption}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
