import fs from 'fs';
import path from 'path';
import MiniSearch from 'minisearch';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface NavItem {
  title: string;
  slug: string;
  fullSlug: string;
  group?: 'main-modules';
  icon?: string;
  order?: number;
  description?: string;
  children?: NavItem[];
  type?: string;
  childCount?: number;
}

export interface PageData {
  title: string;
  slug: string;
  fullSlug: string;
  content: string;
  isSection?: boolean;
  children?: NavItem[];
}

export interface PageIndexEntry {
  slug: string;
  title: string;
  isSection: boolean;
  chunk: number;
}

interface SearchDocument {
  id: number;
  pageSlug: string;
  anchor: string;
  heading: string;
  headingLevel: number;
  bodyText: string;
  pageTitle: string;
  breadcrumb: string[];
}

interface SearchIndexFile {
  builtAt: string;
  pagesIndexed: number;
  pagesSkipped: number;
  documentCount: number;
  documents: SearchDocument[];
}

export interface SearchHit {
  pageSlug: string;
  anchor: string;
  heading: string;
  snippet: string;
  breadcrumb: string[];
  pageTitle: string;
  score: number;
}

let navigationCache: NavItem[] | null = null;
let pageIndexCache: PageIndexEntry[] | null = null;
const pageCache: Map<string, PageData> = new Map();
let searchIndexCache: SearchIndexFile | null = null;
let miniSearchCache: MiniSearch | null = null;

export function getNavigation(): NavItem[] {
  if (navigationCache) return navigationCache;
  try {
    const navPath = path.join(CONTENT_DIR, 'navigation.json');
    const data = fs.readFileSync(navPath, 'utf-8');
    navigationCache = JSON.parse(data);
    return navigationCache || [];
  } catch (error) {
    console.error('Error loading navigation:', error);
    return [];
  }
}

export function getPageIndex(): PageIndexEntry[] {
  if (pageIndexCache) return pageIndexCache;
  try {
    const indexPath = path.join(CONTENT_DIR, 'page-index.json');
    const data = fs.readFileSync(indexPath, 'utf-8');
    pageIndexCache = JSON.parse(data);
    return pageIndexCache || [];
  } catch (error) {
    console.error('Error loading page index:', error);
    return [];
  }
}

export function getPage(slug: string): PageData | null {
  if (pageCache.has(slug)) {
    return pageCache.get(slug) || null;
  }

  const index = getPageIndex();
  let entry = index.find(e => e.slug === slug);

  if (!entry) {
    const notionIdPattern = /^(.+)-([a-f0-9]{32})$/;
    entry = index.find(e => {
      const match = e.slug.match(notionIdPattern);
      if (match) return match[1] === slug;
      return false;
    });
  }

  if (!entry) {
    const slugParts = slug.split('/');
    if (slugParts.length > 1) {
      const lastPart = slugParts[slugParts.length - 1];
      entry = index.find(e => e.slug.endsWith('/' + lastPart) || e.slug === lastPart);
    }
  }

  if (!entry) {
    const partialMatch = index.find(e => e.slug.endsWith(slug) || slug.endsWith(e.slug));
    if (!partialMatch) return null;
    return getPage(partialMatch.slug);
  }

  try {
    const chunkPath = path.join(CONTENT_DIR, `pages-${entry.chunk}.json`);
    const data = fs.readFileSync(chunkPath, 'utf-8');
    const chunk = JSON.parse(data);

    const page = chunk[entry.slug];
    if (page) {
      pageCache.set(entry.slug, page);
      if (slug !== entry.slug) pageCache.set(slug, page);
      return page;
    }

    return null;
  } catch (error) {
    console.error('Error loading page:', error);
    return null;
  }
}

function getSearchIndex(): SearchIndexFile {
  if (searchIndexCache) return searchIndexCache;
  try {
    const indexPath = path.join(CONTENT_DIR, 'search-index.json');
    const data = fs.readFileSync(indexPath, 'utf-8');
    searchIndexCache = JSON.parse(data);
    return searchIndexCache!;
  } catch (error) {
    console.error('Error loading search index:', error);
    return { builtAt: '', pagesIndexed: 0, pagesSkipped: 0, documentCount: 0, documents: [] };
  }
}

function getMiniSearch(): MiniSearch {
  if (miniSearchCache) return miniSearchCache;
  const idx = getSearchIndex();
  const ms = new MiniSearch({
    fields: ['heading', 'bodyText', 'pageTitle', 'breadcrumbText'],
    storeFields: ['pageSlug', 'anchor', 'heading', 'bodyText', 'pageTitle', 'breadcrumb'],
    searchOptions: {
      boost: { heading: 3, pageTitle: 2, breadcrumbText: 1, bodyText: 1 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: 'AND',
    },
  });
  ms.addAll(idx.documents.map(d => ({
    ...d,
    breadcrumbText: Array.isArray(d.breadcrumb) ? d.breadcrumb.join(' ') : '',
  })));
  miniSearchCache = ms;
  return ms;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extractSnippet(bodyText: string, query: string): string {
  if (!bodyText) return '';
  const safeBody = escapeHtml(bodyText);
  const terms = query.trim().split(/\s+/).filter(Boolean);
  const TOTAL_WORDS = 30;
  const WORDS_BEFORE = 5;
  const WORDS_AFTER = TOTAL_WORDS - WORDS_BEFORE;

  if (terms.length === 0) {
    const allWords = safeBody.split(/\s+/);
    const first = allWords.slice(0, TOTAL_WORDS).join(' ');
    return allWords.length > TOTAL_WORDS ? first + ' …' : first;
  }

  const lowerBody = safeBody.toLowerCase();
  let earliestMatch = -1;
  for (const t of terms) {
    const idx = lowerBody.indexOf(t.toLowerCase());
    if (idx !== -1 && (earliestMatch === -1 || idx < earliestMatch)) {
      earliestMatch = idx;
    }
  }

  let snippet: string;
  if (earliestMatch === -1) {
    const allWords = safeBody.split(/\s+/);
    snippet = allWords.slice(0, TOTAL_WORDS).join(' ');
    if (allWords.length > TOTAL_WORDS) snippet = snippet + ' …';
  } else {
    const words = safeBody.split(/\s+/);
    let charPos = 0;
    let matchWordIdx = 0;
    for (let i = 0; i < words.length; i++) {
      if (charPos + words[i].length >= earliestMatch) {
        matchWordIdx = i;
        break;
      }
      charPos += words[i].length + 1;
    }
    const startIdx = Math.max(0, matchWordIdx - WORDS_BEFORE);
    const endIdx = Math.min(words.length, matchWordIdx + WORDS_AFTER);
    snippet = words.slice(startIdx, endIdx).join(' ');
    if (startIdx > 0) snippet = '… ' + snippet;
    if (endIdx < words.length) snippet = snippet + ' …';
  }

  for (const t of terms) {
    if (t.length < 2) continue;
    const re = new RegExp(`(${escapeRegex(t)})`, 'gi');
    snippet = snippet.replace(re, '<mark>$1</mark>');
  }
  return snippet;
}

interface MiniSearchHit {
  pageSlug: string;
  anchor: string;
  heading: string;
  bodyText: string;
  pageTitle: string;
  breadcrumb: string[];
  score: number;
}

export function searchPages(query: string, limit = 20): SearchHit[] {
  if (!query.trim()) return [];
  let hits: MiniSearchHit[] = [];
  try {
    const ms = getMiniSearch();
    hits = ms.search(query) as unknown as MiniSearchHit[];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
  return hits.slice(0, limit).map(h => ({
    pageSlug: h.pageSlug,
    anchor: h.anchor,
    heading: h.heading,
    snippet: extractSnippet(h.bodyText, query),
    breadcrumb: Array.isArray(h.breadcrumb) ? h.breadcrumb : [],
    pageTitle: h.pageTitle,
    score: h.score,
  }));
}

export function getPageByFullSlug(fullSlug: string): PageData | null {
  const index = getPageIndex();
  const entry = index.find(e => e.slug === fullSlug);
  if (!entry) return null;
  return getPage(entry.slug);
}
