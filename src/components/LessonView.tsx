'use client';

/**
 * LessonView — matches CCG's lesson-page layout.
 *
 * Takes rendered HTML (from renderContent) + splits it into H2-bounded
 * section cards. Adds a hero card up top and a sticky right-rail TOC of
 * every H2. Mirrors the CCG spec in references/templates/lesson.md.
 */

import { useMemo, useEffect, useState, useRef } from 'react';

interface Section {
  id: string;
  title: string;
  bodyHtml: string;
}

interface SplitResult {
  preambleHtml: string;
  sections: Section[];
}

function slugId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function splitBySections(html: string): SplitResult {
  const parts = html.split(/(<h2[^>]*>[\s\S]*?<\/h2>)/g);
  const preambleHtml = (parts[0] || '').trim();
  const sections: Section[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const h2 = parts[i];
    const body = (parts[i + 1] || '').trim();
    const titleMatch = h2.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    const rawTitle = titleMatch ? titleMatch[1] : '';
    const title = rawTitle.replace(/<[^>]*>/g, '').trim();
    if (!title && !body) continue;
    sections.push({ id: slugId(title), title, bodyHtml: body });
  }
  return { preambleHtml, sections };
}

interface Props {
  title: string;
  html: string;
  eyebrow?: string;
  subtitle?: string;
}

export default function LessonView({ title, html, eyebrow, subtitle }: Props) {
  const { preambleHtml, sections } = useMemo(() => splitBySections(html), [html]);

  const [activeId, setActiveId] = useState<string>(() => sections[0]?.id ?? '');
  const [contentsOpen, setContentsOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContentsOpen(false);
    // Search can navigate before the lesson's section headings have mounted.
    // Scroll once the new content exists, including on same-page hash changes.
    const scrollToSection = () => {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); }
      catch { return; }
      if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' });
    };
    const frame = requestAnimationFrame(scrollToSection);
    window.addEventListener('hashchange', scrollToSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', scrollToSection);
    };
  }, [html, title]);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    const handler = async (event: MouseEvent) => {
      const button = (event.target as Element)?.closest<HTMLButtonElement>('[data-copy-prompt]');
      if (!button || !root.contains(button)) return;
      const code = button.parentElement?.querySelector('code');
      if (!code) return;
      try { await navigator.clipboard.writeText(code.textContent || ''); button.textContent = 'Copied'; }
      catch { button.textContent = 'Select And Copy The Text Below'; }
    };
    root.addEventListener('click', handler);
    return () => root.removeEventListener('click', handler);
  }, [html]);

  useEffect(() => {
    if (sections.length === 0) return;
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [sections]);

  const hasRail = sections.length > 0;

  return (
    <article className="ccg-ln">
      <header className="ccg-ln-hero">
        {eyebrow && <div className="ccg-ln-eyebrow">{eyebrow}</div>}
        <h1 className="ccg-ln-title">{title}</h1>
        {subtitle && <p className="ccg-ln-subtitle">{subtitle}</p>}
      </header>

      {hasRail && (
        <details className="ccs-mobile-contents" open={contentsOpen} onToggle={event => setContentsOpen(event.currentTarget.open)}>
          <summary>Jump To Section <span aria-hidden="true">⌄</span></summary>
          <nav aria-label="Lesson Sections">
            {sections.map(section => (
              <a key={section.id} href={`#${section.id}`} onClick={() => setContentsOpen(false)}>
                {section.title}
              </a>
            ))}
          </nav>
        </details>
      )}

      <div className="ccg-ln-layout">
        <div className="ccg-ln-main" ref={mainRef}>
          {preambleHtml && (
            <div className="ccg-ln-section-card">
              <div dangerouslySetInnerHTML={{ __html: preambleHtml }} />
            </div>
          )}

          {sections.map((s) => (
            <div key={s.id} className="ccg-ln-section-card">
              <h2 id={s.id}>{s.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: s.bodyHtml }} />
            </div>
          ))}

          {sections.length === 0 && !preambleHtml && (
            <div className="ccg-ln-section-card">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          )}
        </div>

        {hasRail && (
          <aside className="ccg-ln-rail">
            <div className="ccg-ln-rail-section">
              <div className="ccg-ln-rail-label">On This Page</div>
              <nav className="ccg-ln-rail-nav">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={s.id === activeId ? 'active' : ''}
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
