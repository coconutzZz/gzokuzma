# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

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

Start the development server on `http://localhost:3000`:

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
