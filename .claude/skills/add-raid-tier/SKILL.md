---
name: add-raid-tier
description: Use when a new WoW raid tier has launched and needs to be wired into this site's Warcraft Logs progression tracking, or moved out of src/data/upcoming.js after it appears on WCL.
---

# Add a Raid Tier

Wires a newly-launched raid into the live progression data fetched from
Warcraft Logs (WCL). Follow this order: the zone id tells the fetcher which
zone to query, the encounter list groups bosses under that raid, the Mythic
Flex flag (if needed) only makes sense once the raid is in that list, and the
`upcoming.js` entry should come out only once WCL is actually returning data.

## Steps

| #   | File                        | Constant                   | Change                                                                            |
| --- | --------------------------- | -------------------------- | --------------------------------------------------------------------------------- |
| 1   | `scripts/wcl-api.js`        | `CURRENT_ZONE_IDS`         | Add the new zone id (see below for how to find/confirm it)                        |
| 2   | `scripts/fetch-wcl-data.js` | `RAID_INSTANCE_ENCOUNTERS` | Add a `'Raid Instance Name': [boss names...]` entry                               |
| 3   | `scripts/fetch-wcl-data.js` | `MYTHIC_FLEX_INSTANCES`    | Only if the raid's mythic tier is "Mythic Flex": add the instance name to the set |
| 4   | `src/data/upcoming.js`      | `upcomingRaids`            | Remove the entry for this raid                                                    |

`scripts/fetch-wcl-stats.js` imports the same `CURRENT_ZONE_IDS` from
`scripts/wcl-api.js` and loops over it too — no separate edit needed there.

If WCL assigns Mythic Flex a brand-new difficulty id (not 5), also add it to
the `DIFF_NAME` map in `scripts/fetch-wcl-data.js`, mapped to `'mythic'` (see
the `TODO @launch` comment next to `MYTHIC_FLEX_INSTANCES`).

## Finding and confirming the zone id

Query the WCL GraphQL API:

```graphql
{
  worldData {
    expansion(id: N) {
      zones {
        id
        name
      }
    }
  }
}
```

Do not trust the returned name alone — WCL can list two zones with the same
name. The comment above `CURRENT_ZONE_IDS` documents a real case: two zones
both named "The Venomous Abyss" (ids 53 and 54), where guild reports land in
53 and 54 returns nothing. Before adding an id, confirm it against a real
guild report's `/zone/rankings/<id>` link on warcraftlogs.com, not against the
zone's name in the dropdown.

## Common mistakes

- **Boss name mismatch.** Each string in `RAID_INSTANCE_ENCOUNTERS` must
  exactly match the WCL encounter/fight name — spelling, punctuation,
  apostrophes. A mismatch doesn't error; that boss's kills just silently never
  match and the boss shows as permanently unkilled.
- **Forgetting `MYTHIC_FLEX_INSTANCES`.** The underlying kill data still
  tracks fine under the `mythic` field, but the UI mislabels the raid's
  mythic tier "Mythic" instead of "MX" / "Mythic Flex".
- **Stale `upcoming.js` entry.** Leaving the raid in `upcomingRaids` after it
  goes live on WCL duplicates it in the rendered progression — one copy from
  the live WCL data, one from the static upcoming list.

## Verification

1. Run `npm run fetch-data` locally (needs `WCL_CLIENT_ID` /
   `WCL_CLIENT_SECRET`), or wait for/check the next `fetch-data.yml` cron run.
2. Check `src/data/wcl-progression.json` for the new raid with the expected
   bosses and kill status.
3. Run `npm test`.
