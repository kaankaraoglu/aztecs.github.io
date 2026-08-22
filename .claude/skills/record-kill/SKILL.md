---
name: record-kill
description: Use when a new boss kill screenshot needs to be added to the site's kill archive.
disable-model-invocation: true
---

# Record a boss kill

A kill entry is one object in the `kills` array in `src/data/kills.js`. `KillCard.vue`
(`src/components`) renders each entry as a card on the home page, showing the
screenshot, raid name, date, and roster by role.

## 1. Drop the screenshot

Save the image to `src/assets/images/kills/`. Observed filenames follow
`snake_case_raid_name_YYYY_MM_DD.ext` — e.g. `march_on_queldanas_2026_05_10.webp`,
`voidspire_2026_04_12.webp`, `glory_of_the_liberation_of_undermine_raider_2025_04_27.jpg`.
Recent entries use `.webp`; a few older ones are `.jpg`. Either is fine as a source —
`vite-plugin-image-optimizer` recompresses PNG/JPEG at 80% and WebP at 82% during the
build, so drop a plain, unoptimized file and let the build handle it.

## 2. Add the entry

Insert into the `kills` array using this shape (required: `raidName`, `imageUrl`, `date`;
`attempts`, `tanks`, `healers`, `dds` are optional):

```js
{
  raidName: 'Boss or Raid Name (Difficulty)',
  imageUrl: killImage('snake_case_raid_name_YYYY_MM_DD.webp'),
  date: '2026-05-10', // or '2026-05-10 21:49' for a specific time
  attempts: 1, // optional, omit if unknown
  tanks: [{ name: 'PlayerName', class: 'druid' }],
  healers: [{ name: 'PlayerName', class: 'priest' }],
  dds: [{ name: 'PlayerName', class: 'warrior' }],
}
```

`killImage()` is already defined at the top of `kills.js` and resolves the filename
against `src/assets/images/kills/` — pass just the filename.

### Valid `class` values

Kebab-case keys from `src/data/wow-classes.js` (`WOW_CLASSES`), as actually used in
`kills.js`: `warrior`, `paladin`, `hunter`, `rogue`, `priest`, `shaman`, `mage`,
`warlock`, `monk`, `druid`, `demon-hunter`, `death-knight`, `evoker`.

## 3. Placement — newest first

`kills` must stay sorted newest-first by `date`; a test enforces this. If this is the
most recent kill, insert it at the top of the array (index 0). Otherwise, insert it
directly before the first existing entry whose `date` is older.

## 4. Verify

```bash
npx vitest run src/data/__tests__/kills.spec.js
```

Confirms `raidName`/`imageUrl`/`date` are present on every entry and that the array is
still sorted newest-first.
