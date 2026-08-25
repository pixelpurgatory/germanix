/**
 * Every user-visible string in the application. Nothing is hardcoded in markup.
 * Phase 1 scaffold — the full page copy lands in phase 4.
 */

export interface SiteContent {
  readonly name: string;
  readonly tagline: string;
}

export interface Content {
  readonly site: SiteContent;
}

export const content: Content = {
  site: {
    name: "NORDWERK",
    tagline: "Applied AI systems for operators.",
  },
};
