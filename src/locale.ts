import { LOCALES, content } from "./content.ts";
import type { Content, Locale } from "./content.ts";

/**
 * Active language.
 *
 * Chosen from ?lang=, then a stored preference, then the browser's own
 * setting, so a German visitor lands on German without touching anything.
 * Everything downstream reads `t()` rather than importing the content object
 * directly, which is what lets the page rebuild in place on a switch.
 */

const STORAGE_KEY = "nordwerk.locale";
const listeners: Array<() => void> = [];

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value);
}

function stored(): Locale | null {
  // Storage throws outright in some privacy modes and sandboxed frames.
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

function detect(): Locale {
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (isLocale(requested)) return requested;

  const saved = stored();
  if (saved) return saved;

  return window.navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

let current: Locale = detect();

export function getLocale(): Locale {
  return current;
}

/** The active language's copy. */
export function t(): Content {
  return content[current];
}

export function setLocale(next: Locale): void {
  if (next === current) return;
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* preference is not persisted, which is not worth failing over */
  }
  applyDocumentLocale();
  for (const listener of listeners) listener();
}

export function onLocaleChange(listener: () => void): void {
  listeners.push(listener);
}

/** Keeps the lang attribute honest for screen readers and hyphenation. */
export function applyDocumentLocale(): void {
  document.documentElement.lang = current;
}
