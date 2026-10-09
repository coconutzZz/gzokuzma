# Gasilska zveza Občine Kuzma

Built with [Nuxt 4](https://nuxt.com/docs/4.x/getting-started/introduction), Storyblok,
Supabase, and Tailwind CSS 3.

## Setup

Use Node.js 24.19.0 or a version matching `engines.node` in `package.json`.
Netlify reads `.nvmrc` to select Node.js 24.19.0 for builds; its default function
runtime follows the supported build version. The application keeps its source
folders at the project root with `srcDir: '.'`.

Nuxt Image is pinned to 2.0.0 because the 2.1.0 IPX adapter leaves image requests
pending during local Windows prerender builds with Nitro 2. Recheck a complete
Netlify build before updating that module.

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `https://localhost:3000` using `server.crt` and
`server.key`. The Nuxt commands trust the operating system's certificate
authorities for outgoing requests.

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

The Netlify production build prerenders `/`, `/novice`, and every published
Storyblok `page`, `article`, and `AssociationPage`, including department start-page
aliases. Route discovery uses all API result pages, so articles do not need to be
linked from the navigation to be generated. Config, gallery, and event records
are data sources rather than standalone pages.

Nuxt shares keyed `useAsyncData` and `useFetch` results across prerendered pages
within each build. This lets every page reuse the main menu and department data;
the generated payloads also provide that data during hydration and navigation.
This cache lasts for the build and is not a persistent 24-hour runtime cache.

Rebuild and deploy manually to update prerendered content. Use `npm run build`
with Netlify's `dist` publish directory to retain the server API routes. Existing
client-side news pagination, event loading, and lazy gallery requests remain live.

The first page of each news list is rendered on the server and reused from Nuxt's
payload during hydration. Its cache key includes the count, tags, author, and CMS
version. Home and news listings prioritize the first card with an image using
`priority-image`; other card images remain lazy. Changing filters and loading
more articles still fetch live CMS data. Run `npm run test:news` to check initial
rendering, payload reuse, pagination, filters, and retries.

Production builds use `features.inlineStyles: true` to include global and
component CSS in the rendered HTML, removing the entry stylesheet request from
the initial render path. Tailwind uses `assets/css/main.css` as its only entry,
and shared fade transitions live in that stylesheet. Verify the generated HTML
after changes to global CSS or client-only plugin styles.

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Component organization

Components are grouped by responsibility and feature:

- `components/ui/`: buttons, modals, and section titles.
- `components/site/`: header, footer, and breadcrumbs.
- `components/content/`: galleries, sharing buttons, statistics, and embedded media.
- `components/history/`, `components/events/`, `components/news/`, and
  `components/departments/`: components belonging to those features.
- `components/dev/`: development helpers.

Keep feature components together even when several pages use them. Nuxt imports
components by filename (`pathPrefix: false`), so filenames must be unique across
these folders. Development helpers retain the `Dev` prefix. Explicit imports
must include the component's folder.

Storyblok components represent CMS blocks and are grouped by feature:

- `storyblok/content/`: page containers and general content blocks.
- `storyblok/news/`: articles and article listings.
- `storyblok/departments/`: department page blocks.
- `storyblok/history/`: the history timeline block.

The Storyblok SDK registers these components globally by filename, so keep CMS
component names unique. `plugins/storyblok-components.ts` preserves existing CMS
name aliases. Components receiving ordinary props, such as department headings
and embedded media, live in the matching `components/` feature folder.

The history timeline's Storyblok block is `storyblok/history/History.vue`; its
entry and gallery components live in `components/history/` and receive application
data.

## Page metadata and social sharing

`usePageSeo()` sets the page title, description, Open Graph and Twitter tags, and
canonical URL during server rendering. The production origin defaults to
`https://gzo-kuzma.si`. Set `NUXT_PUBLIC_SITE_URL` to override it for another
deployment; use an absolute URL including `https://`.

The home page uses the site defaults, and `/novice` has its own title and
description. Both Storyblok catch-all routes use the fetched story metadata.
Articles use `og:type=article`; other pages use `website`.

To override sharing metadata in Storyblok, add these optional fields to the
root content types (for example `Article`, `Page` and `AssociationPage`):

| Field | Storyblok type | Fallback |
| --- | --- | --- |
| `seo_title` | Text | Content title, department page title, story name, site name |
| `seo_description` | Textarea | Description, featured text, article rich text excerpt, department/site description |
| `seo_image` | Asset (images only) | Article image, featured image, default sharing image |

Existing stories work without adding these fields. Rich-text excerpts contain
plain text only and are shortened to 200 characters. Storyblok asset alt text
is used for sharing images when available. The default image is
`public/img/share-default.png` (1200 × 630), rendered from the adjacent SVG.

Canonical and Open Graph page URLs omit query parameters, fragments, trailing
slashes and a terminal `/index` alias. Image URLs keep any image transformation
parameters. Metadata is reactive so it updates when navigating between pages.

For new static pages, call `usePageSeo({ title, description, image })` in
`<script setup>`. Verify a deployed page's HTML source contains the expected
tags, then refresh its cached preview with the social platform's sharing debugger.

## Content images

Use `AppImage` for content photos, gallery images, and association images. It wraps
`NuxtImg`, reserves an aspect ratio, starts the full image request within 200 pixels
of the viewport, and fades the image in after decoding. Set `loading="eager"` for
images visible on initial page load; main page images also use `fetchpriority="high"`.

Storyblok raster assets get a small blurred preview and responsive image URLs.
The provider checks the exact asset CDN hostname and preserves regional hosts.
Other sources use the original URL and a neutral placeholder, without any
Storyblok transformations. Signed assets, SVGs, GIFs, and already transformed
Storyblok URLs are also preserved. An explicit `placeholder` URL can supply a
preview for another source; `:placeholder="false"` disables image previews.
Use `placeholder-background="transparent"` for PNG logos with transparent areas.

Classes and styles apply to the wrapper, including sizing, rounded corners, and
`object-cover` or `object-contain`. Use `class="w-full"` for responsive images.
Storyblok URLs supply the default aspect ratio; for other sources, supply numeric
`width` and `height` or `aspect-ratio` when known (the fallback is 4:3).
Additional image attributes and load/error events pass through the wrapper.

Run `npm run test:images` to verify source handling, deferred loading, decoding,
cached images, source changes, and the fallback for browsers without JavaScript.
