// Auto-discovers every photo/video dropped into src/albums/<Album Name>/...
// Drop folders in, restart nothing — the album UI builds itself.

const imageModules = import.meta.glob(
  "/src/albums/**/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,gif,GIF,avif,AVIF,bmp,BMP}",
  { query: "?url", import: "default", eager: true },
) as Record<string, string>;

const videoModules = import.meta.glob("/src/albums/**/*.{mp4,MP4,webm,WEBM,mov,MOV,m4v,M4V,ogv,OGV}", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

export type MediaItem = {
  id: string;
  kind: "photo" | "video";
  url: string;
  fileName: string;
  /** Sub-folder path inside the album, if any. */
  group: string;
  /** Parsed from the file name when possible. */
  date: Date | null;
  dateLabel: string;
  caption: string;
};

export type Album = {
  slug: string;
  title: string;
  items: MediaItem[];
  cover: MediaItem | null;
  photoCount: number;
  videoCount: number;
  rangeLabel: string;
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Pulls a date out of common camera/scan file names: 20130712, 2013-07-12, IMG_20130712_120000, 1992.04.03 */
function parseDate(fileName: string): Date | null {
  const digits = fileName.replace(/[^0-9]/g, "");
  const match = /(19|20)\d{6}/.exec(digits);
  if (match) {
    const raw = match[0];
    const y = Number(raw.slice(0, 4));
    const m = Number(raw.slice(4, 6));
    const d = Number(raw.slice(6, 8));
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return new Date(y, m - 1, d);
  }
  const yearOnly = /(?:^|[^0-9])((?:19|20)\d{2})(?:[^0-9]|$)/.exec(fileName);
  if (yearOnly) return new Date(Number(yearOnly[1]), 0, 1);
  return null;
}

function prettifyName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/^(?:img|dsc|dscn|vid|mov|photo)[-_ ]?/i, "")
    .replace(/(19|20)\d{6}([-_ ]\d{6})?/g, "")
    .replace(/[-_.]+/g, " ")
    .trim();
}

function buildItem(path: string, url: string, kind: MediaItem["kind"]): MediaItem | null {
  const rel = path.replace("/src/albums/", "");
  const parts = rel.split("/");
  if (parts.length < 2) return null; // loose files at the root are ignored
  const fileName = parts[parts.length - 1];
  const group = parts.slice(1, -1).join(" / ");
  const date = parseDate(fileName);
  return {
    id: rel,
    kind,
    url,
    fileName,
    group,
    date,
    dateLabel: date
      ? `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
      : "Undated",
    caption: prettifyName(fileName) || fileName,
  };
}

function buildAlbums(): Album[] {
  const byAlbum = new Map<string, MediaItem[]>();

  const add = (path: string, url: string, kind: MediaItem["kind"]) => {
    const item = buildItem(path, url, kind);
    if (!item) return;
    const albumTitle = path.replace("/src/albums/", "").split("/")[0];
    const list = byAlbum.get(albumTitle) ?? [];
    list.push(item);
    byAlbum.set(albumTitle, list);
  };

  Object.entries(imageModules).forEach(([p, u]) => add(p, u, "photo"));
  Object.entries(videoModules).forEach(([p, u]) => add(p, u, "video"));

  const albums: Album[] = [...byAlbum.entries()].map(([title, items]) => {
    // Folder is the album; inside the album, order by date (undated last, by name).
    items.sort((a, b) => {
      if (a.date && b.date) return a.date.getTime() - b.date.getTime();
      if (a.date) return -1;
      if (b.date) return 1;
      return a.fileName.localeCompare(b.fileName, undefined, { numeric: true });
    });

    const dated = items.filter((i) => i.date).map((i) => i.date!.getFullYear());
    const rangeLabel = dated.length
      ? Math.min(...dated) === Math.max(...dated)
        ? `${Math.min(...dated)}`
        : `${Math.min(...dated)} – ${Math.max(...dated)}`
      : "Undated";

    return {
      slug: slugify(title),
      title,
      items,
      cover: items.find((i) => i.kind === "photo") ?? items[0] ?? null,
      photoCount: items.filter((i) => i.kind === "photo").length,
      videoCount: items.filter((i) => i.kind === "video").length,
      rangeLabel,
    };
  });

  albums.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  return albums;
}

export const albums = buildAlbums();

export function getAlbum(slug: string) {
  return albums.find((a) => a.slug === slug) ?? null;
}

export const totalItems = albums.reduce((sum, a) => sum + a.items.length, 0);

/** Splits an album into printed pages of up to 4 slots. */
export function paginate(items: MediaItem[], perPage = 4): MediaItem[][] {
  const pages: MediaItem[][] = [];
  for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage));
  if (pages.length % 2 === 1) pages.push([]);
  return pages;
}
