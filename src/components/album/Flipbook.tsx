import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Album, MediaItem } from "@/lib/media-library";
import { paginate } from "@/lib/media-library";
import { MediaLightbox } from "./MediaLightbox";

function Slot({ item, onOpen }: { item: MediaItem; onOpen: () => void }) {
  return (
    <button className="photo-slot group" onClick={onOpen}>
      {item.kind === "video" ? (
        <span className="relative block h-full w-full">
          <video src={item.url} muted preload="metadata" className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-page/85 text-page-ink">
              <Play className="size-4" />
            </span>
          </span>
        </span>
      ) : (
        <img
          src={item.url}
          alt={item.caption}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
      <span className="photo-slot-caption">{item.dateLabel}</span>
    </button>
  );
}

function Page({
  items,
  side,
  number,
  onOpen,
}: {
  items: MediaItem[];
  side: "left" | "right";
  number: number;
  onOpen: (item: MediaItem) => void;
}) {
  return (
    <div className={`album-page album-page-${side}`}>
      {items.length === 0 ? (
        <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.25em] text-page-ink-soft/60">
          End of album
        </div>
      ) : (
        <div className={`grid h-full gap-3 ${items.length === 1 ? "grid-cols-1" : "grid-cols-2"} ${items.length > 2 ? "grid-rows-2" : "grid-rows-1"}`}>
          {items.map((item) => (
            <Slot key={item.id} item={item} onOpen={() => onOpen(item)} />
          ))}
        </div>
      )}
      <span className="album-page-number">{number}</span>
    </div>
  );
}

export function Flipbook({ album }: { album: Album }) {
  const pages = useMemo(() => paginate(album.items), [album]);
  const spreadCount = Math.max(1, Math.ceil(pages.length / 2));
  const [spread, setSpread] = useState(0);
  const [flip, setFlip] = useState<null | "forward" | "back">(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const pageAt = (i: number) => pages[i] ?? [];

  const go = (dir: "forward" | "back") => {
    if (flip) return;
    if (dir === "forward" && spread >= spreadCount - 1) return;
    if (dir === "back" && spread === 0) return;
    setFlip(dir);
    window.setTimeout(() => {
      setSpread((s) => s + (dir === "forward" ? 1 : -1));
      setFlip(null);
    }, 620);
  };

  const baseLeft = flip === "forward" ? spread * 2 : (spread - (flip === "back" ? 1 : 0)) * 2;
  const baseRight = flip === "forward" ? (spread + 1) * 2 + 1 : spread * 2 + 1;

  const openItem = openIndex !== null ? album.items[openIndex] : null;

  return (
    <div className="w-full">
      <div className="book-scene">
        <div className="book">
          <Page
            items={pageAt(baseLeft)}
            side="left"
            number={baseLeft + 1}
            onOpen={(i) => setOpenIndex(album.items.indexOf(i))}
          />
          <Page
            items={pageAt(baseRight)}
            side="right"
            number={baseRight + 1}
            onOpen={(i) => setOpenIndex(album.items.indexOf(i))}
          />

          {flip === "forward" && (
            <div className="flip-sheet flip-sheet-forward">
              <div className="flip-sheet-front">
                <Page items={pageAt(spread * 2 + 1)} side="right" number={spread * 2 + 2} onOpen={() => {}} />
              </div>
              <div className="flip-sheet-back">
                <Page items={pageAt((spread + 1) * 2)} side="left" number={(spread + 1) * 2 + 1} onOpen={() => {}} />
              </div>
            </div>
          )}

          {flip === "back" && (
            <div className="flip-sheet flip-sheet-back-anim">
              <div className="flip-sheet-front">
                <Page items={pageAt((spread - 1) * 2 + 1)} side="right" number={(spread - 1) * 2 + 2} onOpen={() => {}} />
              </div>
              <div className="flip-sheet-back">
                <Page items={pageAt(spread * 2)} side="left" number={spread * 2 + 1} onOpen={() => {}} />
              </div>
            </div>
          )}

          <div className="book-spine" aria-hidden />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button className="page-nav" onClick={() => go("back")} disabled={spread === 0 || !!flip}>
          <ChevronLeft className="size-4" />
          Previous
        </button>
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Spread {spread + 1} / {spreadCount}
        </span>
        <button
          className="page-nav"
          onClick={() => go("forward")}
          disabled={spread >= spreadCount - 1 || !!flip}
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      </div>

      {openItem && (
        <MediaLightbox
          item={openItem}
          albumTitle={album.title}
          onClose={() => setOpenIndex(null)}
          onPrev={
            openIndex! > 0 ? () => setOpenIndex((i) => Math.max(0, (i ?? 0) - 1)) : undefined
          }
          onNext={
            openIndex! < album.items.length - 1
              ? () => setOpenIndex((i) => Math.min(album.items.length - 1, (i ?? 0) + 1))
              : undefined
          }
        />
      )}
    </div>
  );
}
