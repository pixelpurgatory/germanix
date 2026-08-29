import { content } from "./content.ts";
import type { Cta, Metric, NavItem, Section, WorkItem } from "./content.ts";
import { LAYOUT_VH } from "./gl/states.ts";
import type { RevealTarget } from "./scroll.ts";

/**
 * Builds the document from `content.ts`. No user-visible string originates
 * here. Every one is read off the content object, including the document
 * title, the meta description and the CTA glyph.
 */

const SHELL = "mx-auto w-full max-w-[1180px] px-5 md:px-8 lg:px-12";
const GRID = "grid grid-cols-12 gap-x-6";
const COLUMN = {
  left: "col-span-12 md:col-span-8 lg:col-span-6",
  right: "col-span-12 md:col-span-8 md:col-start-5 lg:col-span-6 lg:col-start-7",
} as const;
const SCRIM = {
  left: "scrim-left pointer-events-none absolute inset-y-0 left-0 w-full md:w-3/5",
  right: "scrim-right pointer-events-none absolute inset-y-0 right-0 w-full md:w-3/5",
} as const;

const BODY = "mt-6 max-w-prose text-body text-text";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function link(cta: Cta, className: string): HTMLAnchorElement {
  const node = el("a", className);
  node.href = cta.href;
  return node;
}

/** Solid accent for primary, ruled text link for secondary. */
function ctaLink(cta: Cta, emphasis: "primary" | "quiet"): HTMLAnchorElement {
  const node = link(cta, emphasis === "primary" ? "cta-primary" : "cta-quiet");
  node.append(el("span", "", cta.label), el("span", "cta-glyph", content.ui.ctaGlyph));
  return node;
}

/**
 * Metrics as a ruled row. The value carries the weight; the caption below it
 * stays at label size so the row reads as evidence rather than fine print.
 */
function metricRow(metrics: readonly Metric[]): HTMLElement {
  const list = el("ul", "metric-row");
  for (const metric of metrics) {
    const item = el("li", "metric-cell");
    item.append(el("span", "metric-value", metric.value), el("span", "metric-label", metric.label));
    list.append(item);
  }
  return list;
}

/** Index plus label, with a rule that runs out to the edge of the column. */
function eyebrow(index: string, label: string): HTMLElement {
  const row = el("div", "flex items-center gap-4");
  if (index) row.append(el("span", "eyebrow-index", index));
  if (label) row.append(el("span", "label", label));
  row.append(el("span", "rule"));
  return row;
}

function buildNav(): HTMLElement {
  const nav = el("nav", "topbar");
  const shell = el("div", `${SHELL} flex h-full items-center justify-between gap-8`);

  const brand = link({ label: content.site.name, href: "#" }, "topbar-brand");
  brand.textContent = content.site.name;

  const list = el("ul", "hidden items-center gap-7 lg:flex");
  for (const entry of content.nav.items satisfies readonly NavItem[]) {
    const anchor = link({ label: entry.label, href: entry.href }, "nav-link");
    anchor.dataset["nav"] = entry.index;
    anchor.append(el("span", "nav-index", entry.index), el("span", "", entry.label));
    const li = el("li", "");
    li.append(anchor);
    list.append(li);
  }

  shell.append(brand, list, ctaLink(content.nav.cta, "primary"));
  nav.append(shell);
  return nav;
}

function buildHero(): HTMLElement {
  const hero = content.hero;
  const header = el("header", "relative");
  header.style.height = "var(--h-hero)";

  const inner = el(
    "div",
    "sticky top-0 flex h-screen flex-col justify-end overflow-hidden pb-10 pt-28 md:pb-14",
  );
  inner.append(el("div", SCRIM.left));

  const shell = el("div", `${SHELL} relative`);
  const grid = el("div", GRID);
  const column = el("div", "col-span-12 lg:col-span-9");

  column.append(
    eyebrow("", hero.label),
    el("h1", "mt-8 text-display text-text", hero.headline),
    el("p", `${BODY} mt-7`, hero.body),
    metricRow(hero.meta),
  );

  grid.append(column);
  shell.append(grid);

  const cue = el("div", `${SHELL} relative mt-10 flex items-center gap-3`);
  cue.append(el("span", "scroll-tick"), el("span", "label text-accent", hero.scrollCue));

  inner.append(shell, cue);
  header.append(inner);
  return header;
}

function buildSection(section: Section): HTMLElement {
  const node = el("section", "relative");
  node.id = section.id;
  node.style.height = "var(--h-section)";
  node.setAttribute("aria-labelledby", `${section.id}-headline`);

  const inner = el("div", "sticky top-0 flex h-screen items-center overflow-hidden");
  inner.append(el("div", SCRIM[section.align]));

  const shell = el("div", `${SHELL} relative`);
  const grid = el("div", GRID);
  const column = el("div", COLUMN[section.align]);

  const headline = el("h2", "mt-8 text-headline text-text", section.headline);
  headline.id = `${section.id}-headline`;

  const cta = ctaLink(section.cta, "primary");
  cta.classList.add("mt-10");

  column.append(
    eyebrow(section.index, section.label),
    headline,
    el("p", BODY, section.body),
    metricRow(section.metrics),
    cta,
  );

  grid.append(column);
  shell.append(grid);
  inner.append(shell);
  node.append(inner);
  return node;
}

/** One work row: a whole-row link out to the live site. */
function workRow(item: WorkItem): HTMLAnchorElement {
  const row = el("a", "work-row");
  row.href = item.href;
  row.target = "_blank";
  row.rel = "noopener noreferrer";

  const head = el("div", "work-head");
  const title = el("div", "flex items-baseline gap-3");
  title.append(
    el("span", "eyebrow-index", item.index),
    el("span", "work-name", item.name),
  );
  head.append(title, el("span", "work-discipline", item.discipline));

  const link = el("div", "work-link");
  link.append(el("span", "", item.domain), el("span", "cta-glyph", content.ui.ctaGlyph));

  row.append(head, el("p", "work-note", item.note), link);
  return row;
}

function buildWork(): HTMLElement {
  const work = content.work;
  const node = el("section", "band-work relative border-t border-hairline");
  node.id = work.id;
  node.style.minHeight = "var(--h-work)";
  node.setAttribute("aria-labelledby", `${work.id}-headline`);

  const inner = el("div", "flex min-h-[inherit] items-center py-20");
  const shell = el("div", SHELL);

  const headline = el("h2", "mt-7 text-headline text-text", work.headline);
  headline.id = `${work.id}-headline`;

  const list = el("div", "work-list");
  for (const item of work.items) list.append(workRow(item));

  shell.append(eyebrow("", work.label), headline, list);
  inner.append(shell);
  node.append(inner);
  return node;
}

function buildConversion(): HTMLElement {
  const band = content.conversion;
  const node = el("section", "band-surface relative border-t border-hairline");
  node.id = band.id;
  node.style.minHeight = "var(--h-conversion)";

  const inner = el("div", "flex min-h-[inherit] items-center py-24");
  const shell = el("div", SHELL);
  const grid = el("div", GRID);
  const column = el("div", "col-span-12 lg:col-span-8");

  column.append(
    eyebrow("", band.label),
    el("h2", "mt-8 text-headline text-text", band.headline),
    el("p", BODY, band.body),
    metricRow(band.meta),
  );

  const actions = el("div", "mt-10 flex flex-wrap items-center gap-x-8 gap-y-4");
  actions.append(ctaLink(band.cta, "primary"), ctaLink(band.secondary, "quiet"));
  column.append(actions);

  grid.append(column);
  shell.append(grid);
  inner.append(shell);
  node.append(inner);
  return node;
}

function buildFooter(): HTMLElement {
  const footer = el("footer", "relative border-t border-hairline bg-base");
  const shell = el("div", `${SHELL} py-14`);

  const grid = el("div", `${GRID} gap-y-10`);
  const brand = el("div", "col-span-12 lg:col-span-3");
  brand.append(el("span", "topbar-brand", content.site.name));

  grid.append(brand);
  for (const col of content.footer.columns) {
    const cell = el("div", "col-span-6 md:col-span-4 lg:col-span-3");
    cell.append(el("span", "label", col.heading));
    const list = el("ul", "mt-5 flex flex-col gap-3");
    for (const item of col.items) {
      const anchor = link(item, "footer-link");
      anchor.textContent = item.label;
      const li = el("li", "");
      li.append(anchor);
      list.append(li);
    }
    cell.append(list);
    grid.append(cell);
  }

  const base = el(
    "div",
    "mt-14 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-hairline pt-6",
  );
  base.append(
    el("span", "label text-text", content.footer.rule),
    el("span", "label", content.footer.note),
  );

  shell.append(grid, base);
  footer.append(shell);
  return footer;
}

/**
 * Marks the nav entry for the state currently on screen. Returns a setter so
 * the query runs once rather than on every frame.
 */
export function createNavHighlighter(): (index: number) => void {
  const links = Array.from(document.querySelectorAll<HTMLElement>("[data-nav]"));
  let current = -1;
  return (index: number): void => {
    if (index === current) return;
    current = index;
    links.forEach((node, i) => {
      node.dataset["active"] = String(i === index);
    });
  };
}

/** Fixed hairline column rules, aligned to the content grid. */
function buildGridRules(): HTMLElement {
  const layer = el("div", "grid-rules");
  layer.setAttribute("aria-hidden", "true");
  const shell = el("div", `${SHELL} h-full`);
  const inner = el("div", "grid-rules-inner");
  shell.append(inner);
  layer.append(shell);
  return layer;
}

function applyLayoutVars(): void {
  const root = document.documentElement.style;
  root.setProperty("--h-hero", `${LAYOUT_VH.hero}vh`);
  root.setProperty("--h-section", `${LAYOUT_VH.section}vh`);
  root.setProperty("--h-work", `${LAYOUT_VH.work}vh`);
  root.setProperty("--h-conversion", `${LAYOUT_VH.conversion}vh`);
  root.setProperty("--h-footer", `${LAYOUT_VH.footer}vh`);
}

function applyDocumentMeta(): void {
  document.title = content.site.title;
  const meta = document.createElement("meta");
  meta.name = "description";
  meta.content = content.site.description;
  document.head.append(meta);
}

/**
 * Renders the whole page into `mount`. Called once, before the GL loop starts.
 * Returns the sticky blocks whose copy needs crossfading, with the heights the
 * fade windows are derived from.
 */
export function buildPage(mount: HTMLElement): readonly RevealTarget[] {
  applyLayoutVars();
  applyDocumentMeta();

  const hero = buildHero();
  const sections = content.sections.map(buildSection);

  mount.replaceChildren(
    buildGridRules(),
    buildNav(),
    hero,
    ...sections,
    buildWork(),
    buildConversion(),
    buildFooter(),
  );

  return [
    { node: hero, heightVh: LAYOUT_VH.hero },
    ...sections.map((node) => ({ node, heightVh: LAYOUT_VH.section })),
  ];
}
