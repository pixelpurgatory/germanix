import type { BookPanel, Cta, ExamplesPanel, FormField, PanelBase, RecordPanel } from "./content.ts";
import { t } from "./locale.ts";
import { SHOTS } from "./assets.ts";

/**
 * The two destination pages, as overlays rather than separate documents.
 *
 * A real navigation would tear down the WebGL context and rebuild it on the
 * way back, which the hard constraints forbid. These sit above the persistent
 * canvas instead, addressed by hash so the links are shareable and the back
 * button behaves, and the particle system keeps running underneath.
 */

const SHELL = "mx-auto w-full max-w-[1180px] px-5 md:px-8 lg:px-12";

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

function ctaLink(cta: Cta): HTMLAnchorElement {
  const node = el("a", "cta-primary");
  node.href = cta.href;
  node.append(el("span", "", cta.label), el("span", "cta-glyph", t().ui.ctaGlyph));
  return node;
}

function block(heading: string): HTMLElement {
  const section = el("section", "panel-block");
  section.append(el("h3", "label", heading));
  return section;
}

/** Numbered list of plain strings, ruled like the metrics rows. */
function ruledList(items: readonly string[]): HTMLElement {
  const list = el("ul", "panel-list");
  for (const item of items) list.append(el("li", "panel-list-item", item));
  return list;
}

function metricGrid(items: readonly { value: string; label: string }[]): HTMLElement {
  const grid = el("ul", "metric-row");
  for (const item of items) {
    const cell = el("li", "metric-cell");
    cell.append(el("span", "metric-value", item.value), el("span", "metric-label", item.label));
    grid.append(cell);
  }
  return grid;
}

function shell(panel: PanelBase): { root: HTMLElement; body: HTMLElement } {
  const root = el("div", "panel");
  root.id = `panel-${panel.id}`;
  root.hidden = true;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-labelledby", `${panel.id}-title`);

  const bar = el("div", "panel-bar");
  const barShell = el("div", `${SHELL} flex h-full items-center justify-between gap-6`);
  const close = el("button", "panel-close");
  close.type = "button";
  close.dataset["close"] = "true";
  close.append(el("span", "", panel.close), el("span", "", t().ui.closeGlyph));
  barShell.append(el("span", "label", panel.label), close);
  bar.append(barShell);

  const scroll = el("div", "panel-scroll");
  const body = el("div", `${SHELL} panel-body`);

  const title = el("h2", "text-headline text-text", panel.title);
  title.id = `${panel.id}-title`;
  body.append(title, el("p", "panel-intro", panel.intro));

  scroll.append(body);
  root.append(bar, scroll);
  return { root, body };
}

function buildBook(panel: BookPanel): HTMLElement {
  const { root, body } = shell(panel);

  const phases = block(panel.phases.heading);
  const steps = el("ol", "phase-list");
  for (const phase of panel.phases.items) {
    const item = el("li", "phase");
    item.append(
      el("span", "phase-range", phase.range),
      el("h4", "phase-title", phase.title),
      el("p", "phase-body", phase.body),
    );
    steps.append(item);
  }
  phases.append(steps);

  const deliverables = block(panel.deliverables.heading);
  deliverables.append(ruledList(panel.deliverables.items));

  const requirements = block(panel.requirements.heading);
  requirements.append(ruledList(panel.requirements.items));

  const terms = block(panel.terms.heading);
  terms.append(metricGrid(panel.terms.items));

  body.append(phases, deliverables, requirements, terms, buildForm(panel));
  return root;
}

function field(spec: FormField): HTMLElement {
  const variant =
    spec.type === "textarea" ? "field field-wide" : spec.type === "select" ? "field field-select" : "field";
  const wrap = el("div", variant);
  const id = `f-${spec.name.toLowerCase()}`;

  const label = el("label", "field-label", spec.label);
  label.htmlFor = id;

  let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  if (spec.type === "textarea") {
    input = el("textarea", "field-input");
    input.rows = 4;
    if (spec.placeholder) input.placeholder = spec.placeholder;
  } else if (spec.type === "select") {
    const select = el("select", "field-input");
    for (const option of spec.options) {
      const node = el("option", "", option);
      node.value = option;
      select.append(node);
    }
    input = select;
  } else {
    const text = el("input", "field-input");
    text.type = spec.type;
    if (spec.placeholder) text.placeholder = spec.placeholder;
    input = text;
  }

  input.id = id;
  input.name = spec.name;
  input.required = spec.required;

  wrap.append(label, input);
  return wrap;
}

/**
 * No backend, so the form composes a mail rather than pretending to submit.
 * The address is shown alongside, because a mailto can be silently swallowed
 * by a sandboxed frame or a machine with no mail client configured.
 */
function buildForm(panel: BookPanel): HTMLElement {
  const spec = panel.form;
  const section = block(spec.heading);
  section.append(el("p", "panel-note", spec.note));

  const form = el("form", "form-grid");
  form.noValidate = false;
  for (const item of spec.fields) form.append(field(item));

  const submit = el("button", "cta-primary form-submit");
  submit.type = "submit";
  submit.append(el("span", "", spec.submit), el("span", "cta-glyph", t().ui.ctaGlyph));

  const status = el("p", "form-status");
  status.hidden = true;
  status.setAttribute("role", "status");

  const fallback = el("a", "form-fallback");
  fallback.href = `mailto:${spec.mailto}`;
  fallback.textContent = spec.fallback;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const lines = spec.fields.map((f) => `${f.label}: ${String(data.get(f.name) ?? "")}`);
    const href = `mailto:${spec.mailto}?subject=${encodeURIComponent(spec.subject)}&body=${encodeURIComponent(lines.join("\n\n"))}`;

    status.textContent = spec.success;
    status.hidden = false;
    status.append(document.createTextNode(" "), fallback);

    const opener = el("a", "");
    opener.href = href;
    opener.rel = "noopener";
    opener.click();
  });

  form.append(submit);
  section.append(form, status);
  return section;
}

/**
 * Transcript gallery. Phone screenshots sit beside their note, desktop ones
 * below it, because a 660px phone shot next to text reads far better than a
 * full-width one and a Slack window does not survive being squeezed.
 */
function buildExamples(panel: ExamplesPanel): HTMLElement {
  const { root, body } = shell(panel);

  for (const item of panel.items) {
    const section = el("section", `example example--${item.orientation}`);

    const head = el("div", "flex flex-wrap items-baseline gap-x-4 gap-y-2");
    head.append(
      el("span", "eyebrow-index", item.index),
      el("span", "example-platform", item.platform),
      el("span", "label", item.tag),
    );

    const text = el("div", "example-text");
    text.append(head, el("h3", "example-name", item.client), el("p", "example-note", item.note));

    const figure = el("figure", "example-shot");
    const shot = SHOTS[item.image];
    if (shot) {
      const img = el("img", "");
      img.src = shot.src;
      img.width = shot.width;
      img.height = shot.height;
      img.alt = item.alt;
      img.loading = "lazy";
      img.decoding = "async";
      figure.append(img);
    }

    const grid = el("div", "example-grid");
    grid.append(text, figure);
    section.append(grid);
    body.append(section);
  }

  const outro = el("section", "panel-block");
  outro.append(el("p", "panel-intro", panel.outro));
  const cta = ctaLink(panel.cta);
  cta.classList.add("mt-10");
  outro.append(cta);
  body.append(outro);

  return root;
}

function buildRecord(panel: RecordPanel): HTMLElement {
  const { root, body } = shell(panel);

  const tableBlock = block(panel.table.heading);
  const scroller = el("div", "table-scroll");
  const table = el("table", "record-table");

  const thead = el("thead", "");
  const headRow = el("tr", "");
  for (const column of panel.table.columns) {
    const cell = el("th", "");
    cell.scope = "col";
    cell.textContent = column;
    headRow.append(cell);
  }
  thead.append(headRow);

  const tbody = el("tbody", "");
  for (const row of panel.table.rows) {
    const tr = el("tr", "");
    tr.append(
      el("td", "cell-year", row.year),
      el("td", "cell-client", row.client),
      el("td", "cell-mono", row.practice),
      el("td", "", row.scope),
      el("td", "cell-result", row.result),
      el("td", "cell-mono", row.status),
    );
    tbody.append(tr);
  }

  table.append(thead, tbody);
  scroller.append(table);
  tableBlock.append(scroller);

  const method = block(panel.method.heading);
  const defs = el("dl", "def-list");
  for (const item of panel.method.items) {
    defs.append(el("dt", "def-term", item.term), el("dd", "def-body", item.body));
  }
  method.append(defs);

  const incidents = block(panel.incidents.heading);
  incidents.append(metricGrid(panel.incidents.items));

  body.append(tableBlock, method, incidents);
  return root;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Hash router over the panels. Opening pushes a history entry the way an
 * anchor would; closing replaces the URL and re-routes, so the back button
 * never lands the reader on a panel they just dismissed.
 */
let restoreFocus: HTMLElement | null = null;
let listenersInstalled = false;

/** Looked up in the DOM rather than held in a closure, because a language
 *  switch replaces every panel node while these listeners stay put. */
function openPanel(): HTMLElement | null {
  const id = location.hash.replace(/^#/, "");
  return id ? document.getElementById(`panel-${id}`) : null;
}

function route(): void {
  const open = openPanel();

  for (const node of document.querySelectorAll<HTMLElement>(".panel")) {
    node.hidden = node !== open;
  }
  document.documentElement.classList.toggle("panel-open", open !== null);

  if (open) {
    if (!restoreFocus) restoreFocus = document.activeElement as HTMLElement | null;
    const scroller = open.querySelector<HTMLElement>(".panel-scroll");
    if (scroller) scroller.scrollTop = 0;
    open.querySelector<HTMLElement>("[data-close]")?.focus();
  } else if (restoreFocus) {
    restoreFocus.focus();
    restoreFocus = null;
  }
}

function close(): void {
  history.pushState(null, "", `${location.pathname}${location.search}`);
  route();
}

function installListeners(): void {
  if (listenersInstalled) return;
  listenersInstalled = true;

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-close]")) close();
  });

  document.addEventListener("keydown", (event) => {
    const open = openPanel();
    if (!open) return;

    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(open.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("hashchange", route);
  window.addEventListener("popstate", route);
}

export function mountPanels(mount: HTMLElement): void {
  mount.append(
    buildBook(t().panels.book),
    buildRecord(t().panels.record),
    buildExamples(t().panels.examples),
  );
  installListeners();
  route();
}
