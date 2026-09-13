/**
 * Shared Call Recordings category list.
 * Keep titles and slugs in sync with content/recordings.json
 * and content/navigation.json.
 */
export const RECORDING_CATEGORIES = [
  { slug: 'weekly-coaching', name: 'Weekly Coaching' },
  { slug: 'sales-training', name: 'Sales Training' },
] as const;

export const ALLOWED_CATEGORY_SLUGS = new Set<string>(
  RECORDING_CATEGORIES.map((c) => c.slug),
);

/** Old public slugs that should land on the renamed category. */
export const LEGACY_CATEGORY_REDIRECTS: Record<string, string> = {
  'coaching-calls': 'weekly-coaching',
};
