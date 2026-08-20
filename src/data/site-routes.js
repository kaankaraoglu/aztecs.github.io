/**
 * The site's public, crawlable routes and their metadata.
 *
 * One source for three things that used to drift apart: the router's per-route
 * title/description, the sitemap, and the static HTML the GitHub Pages deploy
 * needs for each route. Plain ESM with no imports, so `scripts/postbuild.js`
 * can read it directly under Node.
 *
 * Redirects and the catch-all 404 are deliberately absent.
 */

export const SITE_ORIGIN = 'https://aztecs.se'

export const DEFAULT_DESCRIPTION =
  "Aztecs - an established Horde guild on Al'Akir since 2005. Raiding, Mythic+, and good times."

/** @type {ReadonlyArray<{ path: string, title: string, description: string, priority: string }>} */
export const SITE_ROUTES = Object.freeze([
  {
    path: '/',
    title: "Aztecs - Horde Guild on Al'Akir",
    description: DEFAULT_DESCRIPTION,
    priority: '1.0',
  },
  {
    path: '/raiding',
    title: 'Aztecs - Raiding',
    description:
      "Live raid progression, boss kills, and Mythic+ rankings for Aztecs on Al'Akir (EU).",
    priority: '0.8',
  },
  {
    path: '/achievements',
    title: 'Aztecs - Achievements',
    description:
      'Our proudest raid achievements, boss kills, and guild milestones throughout the years.',
    priority: '0.8',
  },
  {
    path: '/next-tier',
    title: 'Aztecs - Next Tier Signups',
    description: "Sign up for the next raid tier with Aztecs on Al'Akir (EU).",
    priority: '0.8',
  },
  {
    path: '/contact',
    title: 'Aztecs - Contact & Roster',
    description:
      "Get in touch with Aztecs or browse our current roster. Horde guild on Al'Akir (EU).",
    priority: '0.7',
  },
  {
    path: '/about',
    title: 'Aztecs - About Us',
    description: "Learn about Aztecs, a Horde guild on Al'Akir (EU) raiding since 2005.",
    priority: '0.6',
  },
  {
    path: '/in-memoriam',
    title: 'Aztecs - In Memoriam',
    description: "Remembering the friends and guildmates we've lost along the way.",
    priority: '0.5',
  },
])
