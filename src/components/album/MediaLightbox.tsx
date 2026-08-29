import { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, RefreshCw, X } from "lucide-react";
import type { MediaItem } from "@/lib/media-library";

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-page-line/60 bg-page/90 px-2 py-1 backdrop-blur">
      <button className="lightbox-tool" onClick={() => zoomOut(0.4)} aria-label="Zoom out">
        <Minus className="size-4" />
      </button>
      <button className="lightbox-tool" onClick={() => zoomIn(0.4)} aria-label="Zoom in">
        <Plus className="size-4" />
      </button>
      <button className="lightbox-tool" onClick={() => resetTransform()} aria-label="Reset zoom">
        <RotateCcw className="size-4" />
      </button>
    </div>
  );
}

type Props = {
  item: MediaItem;
  albumTitle: string;
  onClose: () => void;
  onPrev?: (() => void) | undefined;
  onNext?: (() => void) | undefined;
};

export function MediaLightbox({ item, albumTitle, onClose, onPrev, onNext }: Props) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => setFlipped(false), [item.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key.toLowerCase() === "f") setFlipped((f) => !f);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-backdrop/95 backdrop-blur-sm">
      <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="min-w-0">
          <p className="truncate font-display text-lg text-page-ink">{item.caption}</p>
          <p className="truncate text-xs uppercase tracking-[0.18em] text-page-ink-soft">
            {albumTitle} · {item.dateLabel}
          </p>
        </div>
        <button className="lightbox-tool" onClick={onClose} aria-label="Close">
          <X className="size-5" />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-14">
        {onPrev && (
          <button className="lightbox-nav left-1 sm:left-4" onClick={onPrev} aria-label="Previous">
            <ChevronLeft className="size-5" />
          </button>
        )}

        {item.kind === "video" ? (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full rounded-md shadow-lift"
          />
        ) : (
          <div className="flip-scene h-full w-full">
            <div className={`flip-card ${flipped ? "is-flipped" : ""}`}>
              <div className="flip-face">
                <TransformWrapper
                  key={item.url}
                  doubleClick={{ mode: "toggle", step: 1.6 }}
                  minScale={1}
                  maxScale={8}
                  wheel={{ step: 0.12 }}
                >
                  <>
                    <TransformComponent
                      wrapperClass="!h-full !w-full"
                      contentClass="!h-full !w-full !items-center !justify-center"
                    >
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="max-h-full max-w-full object-contain shadow-lift"
                      />
                    </TransformComponent>
                    <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
                      <ZoomControls />
                    </div>
                  </>
                </TransformWrapper>
              </div>

              <div className="flip-face flip-back">
                <div className="mx-auto flex h-full max-h-[70vh] w-full max-w-md flex-col justify-center gap-3 rounded-md bg-page p-8 text-page-ink shadow-lift">
                  <p className="text-xs uppercase tracking-[0.2em] text-page-ink-soft">Back of photo</p>
                  <p className="font-display text-2xl">{item.caption}</p>
                  <dl className="space-y-1 text-sm text-page-ink-soft">
                    <div>{item.dateLabel}</div>
                    <div>{albumTitle}</div>
                    {item.group && <div>{item.group}</div>}
                    <div className="break-all font-mono text-[11px]">{item.fileName}</div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {onNext && (
          <button className="lightbox-nav right-1 sm:right-4" onClick={onNext} aria-label="Next">
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      <footer className="flex justify-center gap-2 pb-6">
        {item.kind === "photo" && (
          <button className="lightbox-pill" onClick={() => setFlipped((f) => !f)}>
            <RefreshCw className="size-4" />
            {flipped ? "Show photo" : "Flip photo"}
          </button>
        )}
        {item.kind === "photo" && (
          <span className="hidden items-center text-xs text-page-ink-soft sm:flex">
            Scroll or double-click to zoom · arrows to browse
          </span>
        )}
      </footer>
    </div>
  );
}
