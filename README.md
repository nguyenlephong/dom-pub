# dom-pub

All public resources for Nguyen Le Phong's public web properties.

## ICDN layout

The `icdn/` namespace is used as the static image CDN for
`nguyenlephong.github.io`.

- `icdn/blogs/{post-slug}/{semantic-image-name}.webp`
- `icdn/notes/{note-slug}/{semantic-image-name}.webp`
- `icdn/gallery/{category}/{semantic-image-name}.webp`
- `icdn/og/blogs/{post-slug}.jpg`
- `icdn/og/notes/{note-slug}.jpg`

The site consumes these through GitHub Pages:

```text
https://nguyenlephong.github.io/dom-pub/icdn/...
```

Keep paths stable and semantic. Prefer adding new versioned/semantic filenames
over replacing existing files in place when content materially changes.

## Editorial diagram sources

Deterministic technical diagrams live under `sources/editorial-diagrams/` and
are rendered to WebP with:

```bash
npm run generate:editorial-diagrams
npm test
```

The verification step checks every generated diagram and editorial image for
its expected format and dimensions before the assets are published.
