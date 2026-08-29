import { createFileRoute, Link } from "@tanstack/react-router";
import { albums, totalItems } from "@/lib/media-library";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Family Album — every photo, page by page" },
      {
        name: "description",
        content:
          "A browsable family photo album: drop folders of photos and videos in, flip through pages, zoom into any picture and play videos.",
      },
      { property: "og:title", content: "Family Album — every photo, page by page" },
      {
        property: "og:description",
        content:
          "Flip through albums built straight from your folders of family photos and videos.",
      },
    ],
  }),
  component: Shelf,
});

function Shelf() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16 sm:px-10">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">The family library</p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          Every album, exactly as she arranged them.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          {albums.length} {albums.length === 1 ? "album" : "albums"} · {totalItems}{" "}
          {totalItems === 1 ? "memory" : "memories"}. Each folder becomes an album, ordered by date.
          Open one to turn the pages.
        </p>
      </header>

      {albums.length === 0 ? (
        <section className="mt-14 rounded-lg border border-dashed border-border p-10">
          <h2 className="font-display text-2xl">No albums yet</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Copy your folders into <code className="rounded bg-muted px-1.5 py-0.5">src/albums/</code>{" "}
            — one folder per album, photos and videos inside. The pages, covers and dates are built
            automatically from the file names.
          </p>
        </section>
      ) : (
        <section className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link key={album.slug} to="/albums/$slug" params={{ slug: album.slug }} className="group block">
              <div className="album-cover">
                {album.cover ? (
                  album.cover.kind === "video" ? (
                    <video src={album.cover.url} muted preload="metadata" className="h-full w-full object-cover" />
                  ) : (
                    <img
                      src={album.cover.url}
                      alt={album.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  )
                ) : null}
              </div>
              <h2 className="mt-5 font-display text-2xl tracking-tight">{album.title}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {album.rangeLabel} · {album.photoCount} photos
                {album.videoCount ? ` · ${album.videoCount} videos` : ""}
              </p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
