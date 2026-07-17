#!/usr/bin/env node
/**
 * Build content/search-index.json from the live pages.
 *
 * CCS pages are stored as markdown strings (`page.content`), unlike ccg-resources
 * which uses block trees. This script walks navigation.json, loads each linked
 * page, splits its markdown at H2/H3 headings, and emits one searchable document
 * per section. Anchor slugs match GitHub-flavoured markdown heading IDs.
 *
 * Output shape matches ccg-resources' search-index.json so the MiniSearch code
 * in src/lib/content.ts is a verbatim port.
 *
 * Runs as a prebuild step. No external deps.
 */
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const NAV_PATH = path.join(CONTENT_DIR, 'navigation.json');
const PAGE_INDEX_PATH = path.join(CONTENT_DIR, 'page-index.json');
const OUT_PATH = path.join(CONTENT_DIR, 'search-index.json');

function headingId(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

// Strip common markdown syntax from body text for cleaner search matches.
function stripMarkdown(md) {
  if (!md) return '';
  return md
    .replace(/```[\s\S]*?```/g, ' ')          // fenced code blocks
    .replace(/`([^`]+)`/g, '$1')              // inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')    // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // links -> link text
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') // bold/italic
    .replace(/^\s*>+\s?/gm, '')               // blockquote markers
    .replace(/^\s*[-*+]\s+/gm, '')            // bullet markers
    .replace(/^\s*\d+\.\s+/gm, '')            // ordered list markers
    .replace(/^\s*#{1,6}\s+/gm, '')           // stray heading marks (should be gone)
    .replace(/\|/g, ' ')                      // table pipes
    .replace(/^\s*[-=]{3,}\s*$/gm, ' ')       // hr / setext underlines
    .replace(/\s+/g, ' ')
    .trim();
}

// Split a markdown string into sections at every H2 and H3.
// Everything before the first H2/H3 becomes the "intro" section under pageTitle.
function partitionMarkdownIntoSections(md, pageTitle) {
  const sections = [];
  let current = {
    heading: pageTitle,
    anchor: '',
    level: 1,
    bodyLines: [],
  };

  function flush() {
    const bodyText = stripMarkdown(current.bodyLines.join('\n'));
    if (bodyText.length >= 20 || current.heading !== pageTitle) {
      sections.push({
        heading: current.heading,
        anchor: current.anchor,
        level: current.level,
        bodyText,
      });
    }
  }

  const lines = (md || '').split(/\r?\n/);
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      current.bodyLines.push(line);
      continue;
    }
    if (!inFence) {
      const h2 = line.match(/^##\s+(.+?)\s*#*\s*$/);
      const h3 = line.match(/^###\s+(.+?)\s*#*\s*$/);
      const h1 = line.match(/^#\s+(.+?)\s*#*\s*$/);
      if (h1) {
        // H1 usually restates page title — swallow it, do not start a new section.
        continue;
      }
      if (h2 || h3) {
        flush();
        const text = (h2 ? h2[1] : h3[1]).trim();
        current = {
          heading: text,
          anchor: headingId(text),
          level: h2 ? 2 : 3,
          bodyLines: [],
        };
        continue;
      }
    }
    current.bodyLines.push(line);
  }
  flush();
  return sections;
}

// Walk navigation.json and emit [{fullSlug, title, breadcrumb}] for every node
// that has a fullSlug. Breadcrumb is the chain of titles from root to this node.
function collectLiveEntries(nav) {
  const out = [];
  function walk(items, trail) {
    if (!Array.isArray(items)) return;
    for (const it of items) {
      if (!it || typeof it !== 'object') continue;
      const nextTrail = it.title ? [...trail, it.title] : trail;
      const fullSlug = it.fullSlug || it.slug;
      if (fullSlug) {
        out.push({
          fullSlug,
          title: it.title || fullSlug,
          breadcrumb: nextTrail,
        });
      }
      if (Array.isArray(it.children)) walk(it.children, nextTrail);
    }
  }
  walk(nav, []);
  return out;
}

function loadChunks(pageIndex) {
  const chunks = {};
  const chunkIds = [...new Set(pageIndex.map(e => e.chunk))];
  for (const id of chunkIds) {
    const p = path.join(CONTENT_DIR, `pages-${id}.json`);
    if (fs.existsSync(p)) {
      chunks[id] = JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  }
  return chunks;
}

function main() {
  const nav = JSON.parse(fs.readFileSync(NAV_PATH, 'utf-8'));
  const pageIndex = JSON.parse(fs.readFileSync(PAGE_INDEX_PATH, 'utf-8'));
  const chunks = loadChunks(pageIndex);

  // Build slug -> page lookup by scanning all chunks (page-index tells us which chunk).
  const pageBySlug = {};
  for (const entry of pageIndex) {
    const chunk = chunks[entry.chunk];
    if (chunk && chunk[entry.slug]) {
      pageBySlug[entry.slug] = chunk[entry.slug];
    }
  }

  const entries = collectLiveEntries(nav);
  const documents = [];
  let docId = 0;
  let pagesWithContent = 0;
  let pagesSkipped = 0;

  for (const entry of entries) {
    const page = pageBySlug[entry.fullSlug];
    if (!page) {
      pagesSkipped++;
      continue;
    }
    const pageTitle = page.title || entry.title;
    const sections = partitionMarkdownIntoSections(page.content || '', pageTitle);

    if (sections.length === 0) {
      pagesSkipped++;
      continue;
    }
    pagesWithContent++;

    for (const sec of sections) {
      documents.push({
        id: ++docId,
        pageSlug: entry.fullSlug,
        anchor: sec.anchor,
        heading: sec.heading,
        headingLevel: sec.level,
        bodyText: sec.bodyText,
        pageTitle,
        breadcrumb: entry.breadcrumb,
      });
    }
  }

  const output = {
    builtAt: new Date().toISOString(),
    pagesIndexed: pagesWithContent,
    pagesSkipped,
    documentCount: documents.length,
    documents,
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2) + '\n');
  console.log(
    `search-index.json: ${documents.length} sections across ${pagesWithContent} pages (${pagesSkipped} pages had no content)`
  );
}

main();
