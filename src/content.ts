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

export interface WorkItem {
  readonly index: string;
  readonly name: string;
  readonly discipline: string;
  readonly note: string;
  readonly domain: string;
  readonly href: string;
}

export interface Work {
  readonly id: string;
  readonly label: string;
  readonly headline: string;
  readonly items: readonly WorkItem[];
}

export interface FooterColumn {
  readonly heading: string;
  readonly items: readonly Cta[];
}

/** One numbered stage of the assessment. */
export interface Phase {
  readonly range: string;
  readonly title: string;
  readonly body: string;
}

export interface Definition {
  readonly term: string;
  readonly body: string;
}

export interface RecordRow {
  readonly year: string;
  readonly client: string;
  readonly practice: string;
  readonly scope: string;
  readonly result: string;
  readonly status: string;
}

/** Empty `options` and `placeholder` rather than optional keys, which keeps
 *  the builder free of undefined checks under exactOptionalPropertyTypes. */
export interface FormField {
  readonly name: string;
  readonly label: string;
  readonly type: "text" | "email" | "textarea" | "select";
  readonly options: readonly string[];
  readonly placeholder: string;
  readonly required: boolean;
}

export interface PanelBase {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly intro: string;
  readonly close: string;
}

export interface BookPanel extends PanelBase {
  readonly phases: { readonly heading: string; readonly items: readonly Phase[] };
  readonly deliverables: { readonly heading: string; readonly items: readonly string[] };
  readonly requirements: { readonly heading: string; readonly items: readonly string[] };
  readonly terms: { readonly heading: string; readonly items: readonly Metric[] };
  readonly form: {
    readonly heading: string;
    readonly note: string;
    readonly fields: readonly FormField[];
    readonly submit: string;
    readonly mailto: string;
    readonly subject: string;
    readonly success: string;
    readonly fallback: string;
  };
}

export interface RecordPanel extends PanelBase {
  readonly table: {
    readonly heading: string;
    readonly columns: readonly string[];
    readonly rows: readonly RecordRow[];
  };
  readonly method: { readonly heading: string; readonly items: readonly Definition[] };
  readonly incidents: { readonly heading: string; readonly items: readonly Metric[] };
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
    readonly closeGlyph: string;
  };
  readonly nav: {
    readonly items: readonly NavItem[];
    readonly cta: Cta;
  };
  readonly hero: Hero;
  readonly sections: readonly Section[];
  readonly work: Work;
  readonly conversion: Conversion;
  readonly panels: {
    readonly book: BookPanel;
    readonly record: RecordPanel;
  };
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
    closeGlyph: "✕",
  },

  nav: {
    items: [
      { index: "01", label: "Automation", href: "#automation" },
      { index: "02", label: "Immersive", href: "#immersive" },
      { index: "03", label: "Operators", href: "#operators" },
      { index: "04", label: "Vision", href: "#vision" },
    ],
    cta: { label: "Book assessment", href: "#book" },
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
      cta: { label: "Book an automation audit", href: "#book" },
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
      cta: { label: "See how we measure it", href: "#record" },
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
      cta: { label: "Hear a live operator", href: "#book" },
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
      cta: { label: "Map a site deployment", href: "#book" },
      align: "right",
    },
  ],

  work: {
    id: "work",
    label: "SELECTED WORK",
    headline: "A few you can open yourself.",
    items: [
      {
        index: "01",
        name: "Cula",
        discipline: "PLATFORM / DATA",
        note: "Monitoring, reporting and verification for carbon removal, built on live operational data and covering every removal pathway.",
        domain: "cula.tech",
        href: "https://www.cula.tech",
      },
      {
        index: "02",
        name: "Pier88 Coast",
        discipline: "HOSPITALITY / BRAND",
        note: "A coastal destination brand that carries one venue from aperitivo through to the night programme.",
        domain: "pier88coast.com",
        href: "https://pier88coast.com",
      },
      {
        index: "03",
        name: "CRAV",
        discipline: "COMMERCE / BRAND",
        note: "Artisan smashed burger house in Navarra, with ordering built into the brand site rather than bolted beside it.",
        domain: "cravburgers.shop",
        href: "https://www.cravburgers.shop",
      },
    ],
  },

  conversion: {
    id: "engagement",
    label: "ENGAGEMENT",
    headline: "Start with a two-week technical assessment.",
    body: "We read your systems, instrument the process, and come back with a costed plan. It includes the parts we think you should not build. Fixed fee, credited against the first delivery phase.",
    cta: { label: "Book the assessment", href: "#book" },
    secondary: { label: "See the deployment record", href: "#record" },
    meta: [
      { value: "14 DAYS", label: "ASSESSMENT WINDOW" },
      { value: "18,400 EUR", label: "FIXED FEE, CREDITED" },
      { value: "3", label: "SLOTS PER QUARTER" },
    ],
  },

  panels: {
    book: {
      id: "book",
      label: "ENGAGEMENT / ASSESSMENT",
      title: "The two-week assessment.",
      intro: "Fourteen days inside your operation, ending in a costed build plan you own whether or not you hire us for the build. Everything below is what actually happens, in the order it happens.",
      close: "Close",

      phases: {
        heading: "WHAT HAPPENS",
        items: [
          {
            range: "DAY 1 / 2",
            title: "Access and inventory",
            body: "We take read access to the systems in scope and write down what actually runs, including the spreadsheets and scheduled jobs nobody owns any more.",
          },
          {
            range: "DAY 3 / 5",
            title: "Sitting with the work",
            body: "We watch the process being done by the people who do it, timing the manual steps and noting every place they work around the tool instead of through it.",
          },
          {
            range: "DAY 6 / 8",
            title: "Instrumentation",
            body: "We put counters on the parts you cannot currently see. Most teams are guessing at their own volumes by a factor of two, in one direction or the other.",
          },
          {
            range: "DAY 9 / 11",
            title: "Costing",
            body: "Each candidate build gets priced against the hours it removes, the failure modes it introduces, and what it costs to run once we have gone.",
          },
          {
            range: "DAY 12 / 14",
            title: "The write-up",
            body: "You get the plan and a walkthrough with your team. We present the parts we would not build with the same weight as the parts we would.",
          },
        ],
      },

      deliverables: {
        heading: "WHAT YOU GET",
        items: [
          "A written build plan with the phases in costed order",
          "Volume, latency and error baselines that were measured rather than estimated",
          "A list of what we recommend against building, with the reasoning for each",
          "The instrumentation, which stays in your infrastructure and keeps running",
          "A 90 minute walkthrough with your team, recorded if you want it",
        ],
      },

      requirements: {
        heading: "WHAT WE NEED FROM YOU",
        items: [
          "Read access to the systems in scope, granted in the first two days",
          "Two hours with the people who run the process daily",
          "One person who can settle questions about how the process is meant to work",
          "A named security contact if any system holds personal data",
        ],
      },

      terms: {
        heading: "TERMS",
        items: [
          { value: "18,400 EUR", label: "FIXED FEE, CREDITED IN FULL AGAINST PHASE ONE" },
          { value: "14 DAYS", label: "ELAPSED, NOT BILLED DAYS" },
          { value: "3", label: "SLOTS PER QUARTER" },
          { value: "7 DAYS", label: "FREE CANCELLATION BEFORE START" },
        ],
      },

      form: {
        heading: "REQUEST A SLOT",
        note: "Tell us what you run and roughly when you want to start. We reply within two working days, and we say no when we are not the right shop for it.",
        submit: "Send request",
        mailto: "build@nordwerk.systems",
        subject: "Assessment request",
        success: "Your mail client should have opened with the request filled in. If nothing happened, send the same details to the address below.",
        fallback: "build@nordwerk.systems",
        fields: [
          { name: "Name", label: "NAME", type: "text", options: [], placeholder: "", required: true },
          { name: "Company", label: "COMPANY", type: "text", options: [], placeholder: "", required: true },
          { name: "Email", label: "EMAIL", type: "email", options: [], placeholder: "", required: true },
          {
            name: "Practice",
            label: "PRACTICE",
            type: "select",
            options: [
              "Core automation and CRM kernels",
              "Immersive web and real-time 3D",
              "Voice and chat operators",
              "Vision and spatial analytics",
              "Not sure yet",
            ],
            placeholder: "",
            required: true,
          },
          {
            name: "Start",
            label: "EARLIEST START",
            type: "select",
            options: ["This quarter", "Next quarter", "Later this year", "Still deciding"],
            placeholder: "",
            required: true,
          },
          {
            name: "Systems",
            label: "SYSTEMS IN SCOPE",
            type: "textarea",
            options: [],
            placeholder: "Which systems, roughly how many people touch them, and what breaks most often.",
            required: true,
          },
        ],
      },
    },

    record: {
      id: "record",
      label: "ENGAGEMENT / EVIDENCE",
      title: "Deployment record.",
      intro: "Every system we have put into production since 2019, with the number the client judged it on. Clients are listed by sector because most of these contracts do not allow the name. Updated at the end of each quarter.",
      close: "Close",

      table: {
        heading: "IN PRODUCTION",
        columns: ["YEAR", "CLIENT", "PRACTICE", "SCOPE", "RESULT", "STATUS"],
        rows: [
          { year: "2025", client: "Industrial logistics group", practice: "Automation", scope: "Dispatch routing kernel, 6 depots", result: "31 ms p50", status: "Running" },
          { year: "2025", client: "Energy metering utility", practice: "Vision", scope: "Meter reading from pole cameras, 940 units", result: "99.1% precision", status: "Running" },
          { year: "2024", client: "Medical device maker", practice: "Automation", scope: "Complaint intake and triage", result: "4,180 cases / mo", status: "Running" },
          { year: "2024", client: "Regional insurer", practice: "Operators", scope: "First-line claims chat, 3 languages", result: "97.3% first pass", status: "Running" },
          { year: "2024", client: "Port authority", practice: "Vision", scope: "Quay occupancy and safety zones", result: "1,284 cameras", status: "Running" },
          { year: "2023", client: "Wholesale distributor", practice: "Automation", scope: "Order entry from PDF and email", result: "8.4M events / day", status: "Running" },
          { year: "2023", client: "Transit operator", practice: "Operators", scope: "Voice line for service disruption", result: "620 ms turn", status: "Running" },
          { year: "2023", client: "Specialty chemicals", practice: "Platform", scope: "Batch record interface", result: "2.1 s LCP", status: "Running" },
          { year: "2022", client: "Facilities contractor", practice: "Automation", scope: "Work order dispatch, 40 crews", result: "No agreed metric", status: "Handed over" },
          { year: "2022", client: "Furniture manufacturer", practice: "Immersive", scope: "Product configurator, 40 SKUs", result: "58.7 fps p95", status: "Handed over" },
          { year: "2021", client: "Agricultural co-op", practice: "Vision", scope: "Grading line inspection", result: "6.3 W per node", status: "Retired" },
          { year: "2020", client: "Print group", practice: "Automation", scope: "Quote generation from spec sheets", result: "No agreed metric", status: "Retired" },
        ],
      },

      method: {
        heading: "HOW THESE NUMBERS ARE MADE",
        items: [
          {
            term: "In production",
            body: "Carrying real traffic for a paying client for at least 30 consecutive days. Pilots and proofs of concept are not on this table, however well they went.",
          },
          {
            term: "Latency",
            body: "Measured at the service boundary inside our own infrastructure, so it excludes the client network and the browser. p50 and p95 over a rolling 30 days.",
          },
          {
            term: "Detection precision",
            body: "True positives over everything flagged, sampled monthly against a human-labelled set of 2,000 frames drawn from that site rather than from a benchmark.",
          },
          {
            term: "No agreed metric",
            body: "We handed it over before the client and we had agreed on a number to judge it by. We do not backfill figures we were not measuring at the time.",
          },
          {
            term: "Retired",
            body: "The client stopped the service or replaced it. The row stays on the table.",
          },
        ],
      },

      incidents: {
        heading: "INCIDENTS, LAST 24 MONTHS",
        items: [
          { value: "4", label: "SEVERITY ONE INCIDENTS" },
          { value: "71 MIN", label: "LONGEST SINGLE OUTAGE" },
          { value: "100%", label: "WRITTEN UP AND SENT TO THE CLIENT" },
        ],
      },
    },
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
          { label: "Deployment record", href: "#record" },
        ],
      },
    ],
    rule: "NORDWERK SYSTEMS GMBH",
    note: "ALL SYSTEMS DELIVERED WITH SOURCE",
  },
};
