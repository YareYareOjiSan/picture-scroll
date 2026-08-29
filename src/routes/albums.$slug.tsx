import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Flipbook } from "@/components/album/Flipbook";
import { getAlbum } from "@/lib/media-library";

export const Route = createFileRoute("/albums/$slug")({
  loader: ({ params }) => {
    const album = getAlbum(params.slug);
    if (!album) throw notFound();
    return { title: album.title, rangeLabel: album.rangeLabel };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — Family Album` : "Family Album";
    const description = loaderData
      ? `${loaderData.title} (${loaderData.rangeLabel}): flip through the pages, zoom into any photo and play the videos.`
      : "Flip through the family album.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: AlbumPage,
});

function AlbumPage() {
  const { slug } = Route.useParams();
  const album = getAlbum(slug);
  if (!album) return null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            All albums
          </Link>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{album.title}</h1>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {album.rangeLabel} · {album.photoCount} photos
          {album.videoCount ? ` · ${album.videoCount} videos` : ""}
        </p>
      </div>

      <div className="mt-10">
        <Flipbook album={album} />
      </div>
    </main>
  );
}
