import { content } from "./content.ts";
import type { Cta, Metric, Section } from "./content.ts";
import { LAYOUT_VH } from "./gl/states.ts";
import type { RevealTarget } from "./scroll.ts";

/**
 * Builds the document from `content.ts`. No user-visible string originates
 * here — every one is read off the content object, including the document
 * title, the meta description and the CTA glyph.
 */

const SHELL = "mx-auto w-full max-w-[1240px] px-6 md:px-10 lg:px-14";
const GRID = "grid grid-cols-12 gap-x-6";
const COLUMN = {
  left: "col-span-12 md:col-span-7 lg:col-span-5",
  right: "col-span-12 md:col-span-7 md:col-start-6 lg:col-span-5 lg:col-start-8",
} as const;
const SCRIM = {
  left: "scrim-left pointer-events-none absolute inset-y-0 left-0 w-full md:w-3/4",
  right: "scrim-right pointer-events-none absolute inset-y-0 right-0 w-full md:w-3/4",
} as const;

const HEADLINE_SECTION =
  "mt-7 text-[clamp(1.7rem,3.1vw,2.55rem)] font-medium leading-[1.08] tracking-tightest text-text";
const BODY = "mt-6 max-w-prose text-[15px] leading-[1.66] text-text";

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

function ctaLink(cta: Cta, emphasis: "primary" | "quiet"): HTMLAnchorElement {
  const tone =
    emphasis === "primary"
      ? "border-accent text-accent hover:bg-accent hover:text-base"
      : "border-hairline text-muted hover:border-muted hover:text-text";
  const link = el(
    "a",
    `mt-9 inline-flex items-center gap-3 border px-5 py-3 font-mono text-[11px] uppercase leading-none tracking-label transition-colors duration-200 ${tone}`,
  );
  link.href = cta.href;
  link.append(el("span", "", cta.label), el("span", "", content.ui.ctaGlyph));
  return link;
}

function metricList(metrics: readonly Metric[], extra = ""): HTMLElement {
  const list = el(
    "ul",
    `mt-9 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-hairline pt-6 sm:grid-cols-3 ${extra}`,
  );
  for (const metric of metrics) {
    const item = el("li", "flex flex-col gap-2.5");
    item.append(el("span", "metric-value", metric.value), el("span", "metric-label", metric.label));
    list.append(item);
  }
  return list;
}

function buildHero(): HTMLElement {
  const hero = content.hero;
  const header = el("header", "relative", undefined);
  header.style.height = "var(--h-hero)";

  const inner = el(
    "div",
    "sticky top-0 flex h-screen flex-col justify-between overflow-hidden py-8 md:py-12",
  );
  inner.append(el("div", SCRIM.left));

  const topBar = el("div", `${SHELL} relative flex items-baseline justify-between gap-6`);
  topBar.append(
    el("span", "font-mono text-[12px] uppercase tracking-label text-text", content.site.name),
    el("span", "label hidden sm:block", hero.label),
  );

  const middle = el("div", `${SHELL} relative`);
  const grid = el("div", GRID);
  const column = el("div", "col-span-12 lg:col-span-8");
  column.append(
    el(
      "h1",
      "text-[clamp(2.3rem,5.4vw,4.3rem)] font-medium leading-[0.99] tracking-tightest text-text",
      hero.headline,
    ),
    el("p", "mt-8 max-w-prose text-[16px] leading-[1.6] text-text", hero.body),
  );
  grid.append(column);
  middle.append(grid);

  const bottom = el(
    "div",
    `${SHELL} relative flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2`,
  );
  bottom.append(
    // The label class is leading-none, which collides with itself once this
    // list wraps on a narrow viewport.
    el("span", "label leading-[1.6]", hero.meta.join(` ${content.ui.metaSeparator} `)),
    el("span", "label text-accent", hero.scrollCue),
  );

  inner.append(topBar, middle, bottom);
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

  const labelRow = el("div", "flex items-baseline gap-4");
  labelRow.append(
    el("span", "font-mono text-[11px] leading-none tracking-label text-accent", section.index),
    el("span", "label", section.label),
  );

  const headline = el("h2", HEADLINE_SECTION, section.headline);
  headline.id = `${section.id}-headline`;

  column.append(
    labelRow,
    headline,
    el("p", BODY, section.body),
    metricList(section.metrics),
    ctaLink(section.cta, "primary"),
  );

  grid.append(column);
  shell.append(grid);
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
  const column = el("div", "col-span-12 lg:col-span-7");

  column.append(el("span", "label", band.label));
  column.append(
    el(
      "h2",
      "mt-7 text-[clamp(1.9rem,3.4vw,2.8rem)] font-medium leading-[1.06] tracking-tightest text-text",
      band.headline,
    ),
    el("p", BODY, band.body),
    metricList(band.meta),
  );

  const actions = el("div", "flex flex-wrap items-center gap-4");
  actions.append(ctaLink(band.cta, "primary"), ctaLink(band.secondary, "quiet"));
  column.append(actions);

  grid.append(column);
  shell.append(grid);
  inner.append(shell);
  node.append(inner);
  return node;
}

function buildFooter(): HTMLElement {
  const footer = el("footer", "flex items-center border-t border-hairline bg-base");
  footer.style.minHeight = "var(--h-footer)";
  const shell = el("div", `${SHELL} flex flex-wrap items-baseline justify-between gap-4 py-6`);
  shell.append(
    el("span", "label text-text", content.footer.rule),
    el("span", "label", content.footer.note),
  );
  footer.append(shell);
  return footer;
}

function applyLayoutVars(): void {
  const root = document.documentElement.style;
  root.setProperty("--h-hero", `${LAYOUT_VH.hero}vh`);
  root.setProperty("--h-section", `${LAYOUT_VH.section}vh`);
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

  mount.replaceChildren(hero, ...sections, buildConversion(), buildFooter());

  return [
    { node: hero, heightVh: LAYOUT_VH.hero },
    ...sections.map((node) => ({ node, heightVh: LAYOUT_VH.section })),
  ];
}
