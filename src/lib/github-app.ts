import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

const REPO_OWNER = 'seanlongden';
const REPO_NAME = 'ccs-resources';

function getPrivateKey(): string {
  const b64 = process.env.GITHUB_APP_PRIVATE_KEY_B64;
  if (!b64) throw new Error('GITHUB_APP_PRIVATE_KEY_B64 is not set');
  return Buffer.from(b64, 'base64').toString('utf-8');
}

function getAppId(): string {
  const id = process.env.GITHUB_APP_ID;
  if (!id) throw new Error('GITHUB_APP_ID is not set');
  return id;
}

function getInstallationId(): number {
  const id = process.env.GITHUB_APP_INSTALLATION_ID;
  if (!id) throw new Error('GITHUB_APP_INSTALLATION_ID is not set');
  return Number(id);
}

let cachedOctokit: Octokit | null = null;
let cachedAt = 0;
const TOKEN_TTL_MS = 50 * 60 * 1000; // refresh every 50 min (tokens last 60)

export async function getRepoOctokit(): Promise<Octokit> {
  const now = Date.now();
  if (cachedOctokit && now - cachedAt < TOKEN_TTL_MS) return cachedOctokit;

  cachedOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: getAppId(),
      privateKey: getPrivateKey(),
      installationId: getInstallationId(),
    },
  });
  cachedAt = now;
  return cachedOctokit;
}

export const REPO = { owner: REPO_OWNER, name: REPO_NAME };

export async function readFile(path: string, ref = 'main'): Promise<{ content: string; sha: string }> {
  const octokit = await getRepoOctokit();
  const res = await octokit.repos.getContent({ owner: REPO_OWNER, repo: REPO_NAME, path, ref });
  if (Array.isArray(res.data) || res.data.type !== 'file') {
    throw new Error(`Path is not a file: ${path}`);
  }
  if (!res.data.content) {
    const blob = await octokit.git.getBlob({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      file_sha: res.data.sha,
    });
    return {
      content: Buffer.from(blob.data.content, 'base64').toString('utf-8'),
      sha: res.data.sha,
    };
  }
  return {
    content: Buffer.from(res.data.content, 'base64').toString('utf-8'),
    sha: res.data.sha,
  };
}

export async function listFiles(path = '', ref = 'main'): Promise<Array<{ name: string; path: string; type: 'file' | 'dir' }>> {
  const octokit = await getRepoOctokit();
  const res = await octokit.repos.getContent({ owner: REPO_OWNER, repo: REPO_NAME, path, ref });
  if (!Array.isArray(res.data)) return [];
  return res.data.map(e => ({ name: e.name, path: e.path, type: e.type as 'file' | 'dir' }));
}

export async function getBranchSha(branch: string): Promise<string> {
  const octokit = await getRepoOctokit();
  const res = await octokit.git.getRef({ owner: REPO_OWNER, repo: REPO_NAME, ref: `heads/${branch}` });
  return res.data.object.sha;
}

export async function createBranch(branchName: string, fromBranch = 'main'): Promise<string> {
  const octokit = await getRepoOctokit();
  const baseSha = await getBranchSha(fromBranch);
  await octokit.git.createRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });
  return baseSha;
}

export async function writeFile(
  branch: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const octokit = await getRepoOctokit();
  await octokit.repos.createOrUpdateFileContents({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path,
    branch,
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    sha,
  });
}

export async function mergeBranch(branch: string, into = 'main'): Promise<void> {
  const octokit = await getRepoOctokit();
  await octokit.repos.merge({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    base: into,
    head: branch,
    commit_message: `Merge ${branch} via admin panel`,
  });
}
