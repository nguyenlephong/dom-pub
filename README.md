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

The site consumes these through jsDelivr:

```text
https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub@main/icdn/...
```

Keep paths stable and semantic. Prefer adding new versioned/semantic filenames
over replacing existing files in place when content materially changes.
