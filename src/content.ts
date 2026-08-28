/**
 * Every user-visible string in the application, including the document title,
 * the meta description and the CTA glyph. Nothing is hardcoded in markup or in
 * page.ts. If a reader can see it, it is declared here.
 */

export interface Metric {
  readonly value: string;
  readonly label: string;
}

export interface Cta {
  readonly label: string;
  readonly href: string;
}

export interface NavItem {
  readonly index: string;
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
  readonly meta: readonly Metric[];
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

export interface FooterColumn {
  readonly heading: string;
  readonly items: readonly Cta[];
}

export interface Content {
  readonly site: {
    readonly name: string;
    readonly title: string;
    readonly description: string;
  };
  readonly ui: {
    readonly ctaGlyph: string;
    readonly metaSeparator: string;
  };
  readonly nav: {
    readonly items: readonly NavItem[];
    readonly cta: Cta;
  };
  readonly hero: Hero;
  readonly sections: readonly Section[];
  readonly conversion: Conversion;
  readonly footer: {
    readonly columns: readonly FooterColumn[];
    readonly rule: string;
    readonly note: string;
  };
}

export const content: Content = {
  site: {
    name: "NORDWERK",
    title: "NORDWERK / Applied AI systems",
    description:
      "NORDWERK builds and runs business automation, real-time 3D, voice and chat agents, and edge vision systems for enterprise operations teams in Hamburg and Rotterdam.",
  },

  ui: {
    ctaGlyph: "→",
    metaSeparator: "/",
  },

  nav: {
    items: [
      { index: "01", label: "Automation", href: "#automation" },
      { index: "02", label: "Immersive", href: "#immersive" },
      { index: "03", label: "Operators", href: "#operators" },
      { index: "04", label: "Vision", href: "#vision" },
    ],
    cta: { label: "Book assessment", href: "#engagement" },
  },

  hero: {
    label: "APPLIED AI SYSTEMS",
    headline: "Enterprise AI that makes it past the pilot.",
    body: "We are a 27 person engineering shop in Hamburg and Rotterdam. We build automation, interfaces, agents and vision systems, and then we run them. Everything we ship belongs to you, source included.",
    meta: [
      { value: "2019", label: "FOUNDED" },
      { value: "27", label: "ENGINEERS" },
      { value: "SOC 2", label: "TYPE II" },
      { value: "DE / NL", label: "OFFICES" },
    ],
    scrollCue: "SCROLL",
  },

  sections: [
    {
      id: "automation",
      index: "01",
      label: "CORE AUTOMATION / CRM KERNELS",
      headline: "The parts your team still does by hand.",
      body: "Custom CRM kernels, internal assistants, routing and approval logic. We start by sitting with the people doing the work, because the documented process and the one in daily use have usually drifted apart. Everything runs on your infrastructure and the source is yours.",
      metrics: [
        { value: "142", label: "PROCESSES IN PRODUCTION" },
        { value: "8.4M", label: "EVENTS ROUTED DAILY" },
        { value: "31 MS", label: "MEDIAN KERNEL LATENCY" },
      ],
      cta: { label: "Book an automation audit", href: "#engagement" },
      align: "left",
    },
    {
      id: "immersive",
      index: "02",
      label: "IMMERSIVE WEB / REAL-TIME 3D",
      headline: "Real-time 3D that still hits 60fps on a four-year-old laptop.",
      body: "Product configurators, spatial brand work, interactive documentation. We budget the frame before anyone opens a design tool. One context, one draw path, geometry generated in the shader instead of downloaded. If it stutters on the client's own machine, it does not matter how good it looked in the studio.",
      metrics: [
        { value: "58.7 FPS", label: "P95, MID-TIER INTEGRATED GPU" },
        { value: "1.9 S", label: "LARGEST CONTENTFUL PAINT" },
        { value: "41", label: "WEBGL BUILDS SHIPPED" },
      ],
      cta: { label: "See how we budget a build", href: "#engagement" },
      align: "right",
    },
    {
      id: "operators",
      index: "03",
      label: "VOICE & CHAT OPERATORS",
      headline: "Agents that can handle the second question.",
      body: "Chat and voice agents that keep context across channels and know when to hand a call off. We run them in layers: a triage agent, a specialist behind it, and a supervisor reading transcripts. Every decision gets logged, which is usually the first thing your compliance team asks about.",
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
      headline: "Nobody has time to watch the footage.",
      body: "Occupancy, flow, safety compliance and yield inspection. Inference runs on the device and only the summary travels, so the video stays on site unless you decide otherwise. That detail is usually what gets the project through legal.",
      metrics: [
        { value: "1,284", label: "EDGE CAMERAS MANAGED" },
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
    body: "We read your systems, instrument the process, and come back with a costed plan. It includes the parts we think you should not build. Fixed fee, credited against the first delivery phase.",
    cta: { label: "Book the assessment", href: "mailto:build@nordwerk.systems" },
    secondary: { label: "See the deployment record", href: "mailto:build@nordwerk.systems" },
    meta: [
      { value: "14 DAYS", label: "ASSESSMENT WINDOW" },
      { value: "18,400 EUR", label: "FIXED FEE, CREDITED" },
      { value: "3", label: "SLOTS PER QUARTER" },
    ],
  },

  footer: {
    columns: [
      {
        heading: "PRACTICES",
        items: [
          { label: "Core automation", href: "#automation" },
          { label: "Immersive web", href: "#immersive" },
          { label: "Voice and chat", href: "#operators" },
          { label: "Vision systems", href: "#vision" },
        ],
      },
      {
        heading: "OFFICES",
        items: [
          { label: "Hamburg, Hammerbrook", href: "#engagement" },
          { label: "Rotterdam, Katendrecht", href: "#engagement" },
        ],
      },
      {
        heading: "CONTACT",
        items: [
          { label: "build@nordwerk.systems", href: "mailto:build@nordwerk.systems" },
          { label: "Deployment record", href: "mailto:build@nordwerk.systems" },
        ],
      },
    ],
    rule: "NORDWERK SYSTEMS GMBH",
    note: "ALL SYSTEMS DELIVERED WITH SOURCE",
  },
};
