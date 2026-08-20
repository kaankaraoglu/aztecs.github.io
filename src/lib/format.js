/**
 * Formats an ISO timestamp for the "Updated …" lines on the data boxes.
 * Shared so the raid and Mythic+ boxes cannot drift apart.
 * @param {string | null | undefined} isoString
 * @returns {string | null} formatted date, or null when the input is missing or unparseable
 */
export function formatUpdatedAt(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
