# Your albums live here

Drop a folder into this directory for every album:

```
src/albums/
  Summer 1988/
    19880821-beach.jpg
    19880822-boat.mp4
  Grandma's House/
    Kitchen/            <- sub-folders are kept as a caption label
      19920403.jpg
```

- **Folder = album.** Photos inside are ordered by the date found in the file name
  (`19880821`, `1988-08-21`, `IMG_20130712_120000`, …), undated files last.
- Photos: jpg, jpeg, png, webp, gif, avif, bmp.
- Videos: mp4, webm, mov, m4v, ogv.
- Nothing else to configure — the album UI, pages, covers and counts are generated
  from the files themselves.
