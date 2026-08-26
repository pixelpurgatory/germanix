/**
 * Every user-visible string in the application, including the document title,
 * the meta description and the CTA glyph. Nothing is hardcoded in markup or in
 * page.ts — if a reader can see it, it is declared here.
 */

export interface Metric {
  readonly value: string;
  readonly label: string;
}

export interface Cta {
  readonly label: string;
  readonly href: string;
}

export interface Section {
  readonly id: string;
  readonly index: string;
  readonly label: string;
  readonly headline: string;
  readonly body: string;
  readonly metrics: readonly Metric[];
  readonly cta: Cta;
  readonly align: "left" | "right";
}

export interface Hero {
  readonly label: string;
  readonly headline: string;
  readonly body: string;
  readonly meta: readonly string[];
  readonly scrollCue: string;
}

export interface Conversion {
  readonly id: string;
  readonly label: string;
  readonly headline: string;
  readonly body: string;
  readonly cta: Cta;
  readonly secondary: Cta;
  readonly meta: readonly Metric[];
}

export interface Content {
  readonly site: {
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly tagline: string;
  };
  readonly ui: {
    readonly ctaGlyph: string;
    readonly metaSeparator: string;
  };
  readonly hero: Hero;
  readonly sections: readonly Section[];
  readonly conversion: Conversion;
  readonly footer: {
    readonly rule: string;
    readonly note: string;
  };
}

export const content: Content = {
  site: {
    name: "NORDWERK",
    title: "NORDWERK — Applied AI systems",
    description:
      "NORDWERK builds business automation, immersive 3D, voice and chat operators, and computer vision systems for enterprise operations teams.",
    tagline: "Applied AI systems for operations teams.",
  },

  ui: {
    ctaGlyph: "→",
    metaSeparator: "/",
  },

  hero: {
    label: "APPLIED AI SYSTEMS — SINCE 2019",
    headline: "Automation that survives contact with your operation.",
    body: "We build and run the systems enterprise teams depend on daily. Four practices, one engineering standard, and a deployment record we publish rather than describe.",
    meta: ["HAMBURG", "ROTTERDAM", "27 ENGINEERS", "SOC 2 TYPE II"],
    scrollCue: "SCROLL",
  },

  sections: [
    {
      id: "automation",
      index: "01",
      label: "CORE AUTOMATION / CRM KERNELS",
      headline: "Bots, assistants and CRM kernels built on your real process.",
      body: "We map the process you actually run — not the one on the org chart — then replace its manual joints with services you own outright. Custom CRM kernels, internal assistants and routing logic, deployed into your infrastructure and handed over with the source.",
      metrics: [
        { value: "142", label: "PROCESSES IN PRODUCTION" },
        { value: "8.4M", label: "EVENTS ROUTED DAILY" },
        { value: "31 MS", label: "MEDIAN KERNEL LATENCY" },
      ],
      cta: { label: "Scope an automation audit", href: "#engagement" },
      align: "left",
    },
    {
      id: "immersive",
      index: "02",
      label: "IMMERSIVE WEB / REAL-TIME 3D",
      headline: "High-end 3D that holds frame rate on a four-year-old laptop.",
      body: "Real-time product configurators, spatial brand work and interactive documentation. Every build is budgeted before it is designed — one context, one draw path, procedural geometry over downloaded assets — because a showpiece that stutters is not a showpiece.",
      metrics: [
        { value: "58.7 FPS", label: "P95, MID-TIER INTEGRATED GPU" },
        { value: "1.9 S", label: "LARGEST CONTENTFUL PAINT" },
        { value: "41", label: "WEBGL BUILDS SHIPPED" },
      ],
      cta: { label: "Read the build constraints", href: "#engagement" },
      align: "right",
    },
    {
      id: "operators",
      index: "03",
      label: "VOICE & CHAT OPERATORS",
      headline: "Operators that hold a conversation, not a script tree.",
      body: "Lifelike chat and voice agents that carry context across channels, escalate on their own judgement, and log every decision for review. Deployed as cognitive teams — a triage layer, a specialist layer, and a supervisor that answers for both.",
      metrics: [
        { value: "97.3%", label: "INTENT RESOLUTION, FIRST PASS" },
        { value: "620 MS", label: "VOICE TURN LATENCY" },
        { value: "27", label: "LANGUAGES IN SERVICE" },
      ],
      cta: { label: "Hear a live operator", href: "#engagement" },
      align: "left",
    },
    {
      id: "vision",
      index: "04",
      label: "VISION & SPATIAL ANALYTICS",
      headline: "Cameras that produce decisions, not more footage.",
      body: "Computer vision on the edge: occupancy, flow, safety compliance and yield inspection, computed on the device and summarised upstream. Video never leaves the site unless you ask it to, which is usually the difference between approval and a long legal review.",
      metrics: [
        { value: "1,284", label: "EDGE CAMERAS UNDER MANAGEMENT" },
        { value: "99.1%", label: "DETECTION PRECISION" },
        { value: "6.3 W", label: "DRAW PER INFERENCE NODE" },
      ],
      cta: { label: "Map a site deployment", href: "#engagement" },
      align: "right",
    },
  ],

  conversion: {
    id: "engagement",
    label: "ENGAGEMENT",
    headline: "Start with a two-week technical assessment.",
    body: "We read your systems, instrument the process, and return a costed build plan with the parts we would not build. Fixed fee, credited against the first delivery phase.",
    cta: { label: "Book the assessment", href: "mailto:build@nordwerk.systems" },
    secondary: { label: "Request the deployment record", href: "mailto:build@nordwerk.systems" },
    meta: [
      { value: "14 DAYS", label: "ASSESSMENT WINDOW" },
      { value: "€ 18,400", label: "FIXED FEE, CREDITED" },
      { value: "3", label: "SLOTS PER QUARTER" },
    ],
  },

  footer: {
    rule: "NORDWERK SYSTEMS GMBH",
    note: "HAMBURG / ROTTERDAM — BUILD@NORDWERK.SYSTEMS",
  },
};
