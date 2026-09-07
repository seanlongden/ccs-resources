/**
 * Slim admin-tools for ccs-resources.
 *
 * Only exports the two helpers the Call Recordings admin API needs:
 *   - generateBranchName()  — timestamped ai/... branch name
 *   - previewUrlFor(branch) — Vercel preview URL for that branch
 *
 * The CCG version has a much larger tool-use surface (AI editor tool
 * registry, structure ops, etc.) that isn't wired up here yet. When we
 * port the admin AI chat panel, this file will grow.
 */

export function generateBranchName(): string {
  const stamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6);
  return `ai/${stamp}-${rand}`;
}

export function previewUrlFor(branchName: string): string {
  // Vercel's per-branch alias pattern. Branch slashes become dashes.
  const teamSlug = process.env.VERCEL_TEAM_SLUG || 'closing-clients';
  const projectName = 'ccs-resources';
  const branchSlug = branchName.replace(/[\/_]/g, '-').toLowerCase();
  return `https://${projectName}-git-${branchSlug}-${teamSlug}.vercel.app`;
}
