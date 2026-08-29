/**
 * Every user-visible string in the application, in both languages, including
 * the document title, the meta description and the CTA glyph. Nothing is
 * hardcoded in markup, page.ts or panels.ts. If a reader can see it, it is
 * declared here.
 *
 * This file runs well past the 350 line guideline. Splitting it would breach
 * the hard constraint that all copy lives in src/content.ts, so the constraint
 * wins and the file stays whole.
 *
 * Ids, hrefs and anchor targets are deliberately identical across locales, so
 * a link to #book keeps working when the reader switches language.
 */

export type Locale = "en" | "de";

export const LOCALES: readonly Locale[] = ["en", "de"];

/** Switch labels. Shared across locales, so they sit outside Content. */
export const LOCALE_LABELS: Record<Locale, string> = { en: "EN", de: "DE" };

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
  /** Second, quieter action. Only the operators section has one so far. */
  readonly secondary: Cta | null;
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

export interface ExampleItem {
  readonly index: string;
  readonly platform: string;
  readonly client: string;
  readonly tag: string;
  readonly note: string;
  readonly alt: string;
  /** Key into SHOTS in assets.ts. Kept as a string so this module stays
   *  importable by plain Node, which cannot resolve an image import. */
  readonly image: string;
  readonly orientation: "phone" | "wide";
}

export interface ExamplesPanel extends PanelBase {
  readonly items: readonly ExampleItem[];
  readonly outro: string;
  readonly cta: Cta;
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
    readonly languageLabel: string;
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
    readonly examples: ExamplesPanel;
  };
  readonly footer: {
    readonly columns: readonly FooterColumn[];
    readonly rule: string;
    readonly note: string;
  };
}

const MAIL = "build@nordwerk.systems";

const en: Content = {
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
    languageLabel: "Language",
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
    body: "We are a three person engineering shop in Hamburg and Rotterdam. We build automation, interfaces, agents and vision systems, and then we run them. Everything we ship belongs to you, source included.",
    meta: [
      { value: "2019", label: "FOUNDED" },
      { value: "3", label: "ENGINEERS" },
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
      secondary: null,
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
      secondary: null,
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
      secondary: { label: "See real conversations", href: "#examples" },
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
      secondary: null,
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
      { value: "1,400 EUR", label: "FIXED FEE, CREDITED" },
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
          { value: "1,400 EUR", label: "FIXED FEE, CREDITED IN FULL AGAINST PHASE ONE" },
          { value: "14 DAYS", label: "ELAPSED, NOT BILLED DAYS" },
          { value: "3", label: "SLOTS PER QUARTER" },
          { value: "7 DAYS", label: "FREE CANCELLATION BEFORE START" },
        ],
      },

      form: {
        heading: "REQUEST A SLOT",
        note: "Tell us what you run and roughly when you want to start. We reply within two working days, and we say no when we are not the right shop for it.",
        submit: "Send request",
        mailto: MAIL,
        subject: "Assessment request",
        success: "Your mail client should have opened with the request filled in. If nothing happened, send the same details to the address below.",
        fallback: MAIL,
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

    examples: {
      id: "examples",
      label: "CHAT AGENTS / TRANSCRIPTS",
      title: "Four agents, mid-conversation.",
      intro: "Four agents on four platforms, doing four different jobs. The note under each one points at the part that is harder than it looks.",
      close: "Close",
      items: [
        {
          index: "01",
          platform: "WHATSAPP",
          client: "Oak & Ember",
          tag: "RESTAURANT / BOOKINGS",
          note: "The guest changes the time twice and the party size twice, then cancels and un-cancels. One reservation is held through all of it and the guest is never asked to start again. The agent also declines to promise the patio, because the patio depends on the weather.",
          alt: "A WhatsApp conversation with a restaurant booking agent. The guest repeatedly changes the time and party size, asks for a quiet corner table, cancels, then reinstates the booking. The agent confirms five people at 7pm in the quiet corner.",
          image: "whatsapp",
          orientation: "phone",
        },
        {
          index: "02",
          platform: "MESSENGER",
          client: "Pawfect Grooming",
          tag: "PET SERVICES / SCHEDULING",
          note: "Eight separate requirements arrive across five messages: a stylist by name, oatmeal shampoo, ear length, a paw soak, a bandana, the shape of the face trim. All of them survive to the booking, and the cancellation policy is answered the first time it is asked.",
          alt: "A Messenger conversation booking a dog grooming appointment. The owner adds requirements one message at a time, including a named groomer, oatmeal shampoo, a paw soak and a bandana. The agent confirms each and states the cancellation policy.",
          image: "messenger",
          orientation: "phone",
        },
        {
          index: "03",
          platform: "DISCORD",
          client: "Mythic Realms",
          tag: "GAMES / COMMUNITY SUPPORT",
          note: "A mechanics question answered with the actual numbers, in a public channel where a wrong answer is visible to the whole server. It reads from the live design documents, not from a summary written six patches ago.",
          alt: "A Discord channel where a player asks how the stamina system works in boss fights. The bot answers with specific thresholds and regeneration timings, then adds three tactical tips.",
          image: "discord",
          orientation: "wide",
        },
        {
          index: "04",
          platform: "SLACK",
          client: "Internal sales assistant",
          tag: "CONSUMER GOODS / INTERNAL",
          note: "Three people ask follow-ups in one thread and the regional context carries across all of them. It answers in a table when the answer is tabular, flags a competitor promotion with a recommendation attached, and drafts customer-ready copy when asked.",
          alt: "A Slack channel where three colleagues ask a sales assistant about west region volume. It replies with a state-level table, an analysis of competitor discounting, and a draft note to send to accounts.",
          image: "slack",
          orientation: "wide",
        },
      ],
      outro: "Every one of these runs on the client's own account, on the platform their customers already use. We build the agent, connect it to the systems that hold the answers, and then run it.",
      cta: { label: "Talk about an agent", href: "#book" },
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
          { label: MAIL, href: `mailto:${MAIL}` },
          { label: "Deployment record", href: "#record" },
        ],
      },
    ],
    rule: "NORDWERK SYSTEMS GMBH",
    note: "ALL SYSTEMS DELIVERED WITH SOURCE",
  },
};

const de: Content = {
  site: {
    name: "NORDWERK",
    title: "NORDWERK / Angewandte KI-Systeme",
    description:
      "NORDWERK baut und betreibt Geschäftsautomatisierung, Echtzeit-3D, Sprach- und Chat-Agenten sowie Bildverarbeitung am Edge für operative Teams in Hamburg und Rotterdam.",
  },

  ui: {
    ctaGlyph: "→",
    metaSeparator: "/",
    closeGlyph: "✕",
    languageLabel: "Sprache",
  },

  nav: {
    items: [
      { index: "01", label: "Automatisierung", href: "#automation" },
      { index: "02", label: "Immersiv", href: "#immersive" },
      { index: "03", label: "Agenten", href: "#operators" },
      { index: "04", label: "Bildanalyse", href: "#vision" },
    ],
    cta: { label: "Analyse buchen", href: "#book" },
  },

  hero: {
    label: "ANGEWANDTE KI-SYSTEME",
    headline: "Enterprise-KI, die über den Pilotbetrieb hinauskommt.",
    body: "Wir sind ein Ingenieurbüro mit drei Leuten in Hamburg und Rotterdam. Wir bauen Automatisierung, Interfaces, Agenten und Bildverarbeitung, und danach betreiben wir sie. Alles, was wir ausliefern, gehört Ihnen, Quellcode inklusive.",
    meta: [
      { value: "2019", label: "GEGRÜNDET" },
      { value: "3", label: "INGENIEURE" },
      { value: "SOC 2", label: "TYP II" },
      { value: "DE / NL", label: "STANDORTE" },
    ],
    scrollCue: "SCROLLEN",
  },

  sections: [
    {
      id: "automation",
      index: "01",
      label: "KERNAUTOMATISIERUNG / CRM-KERNE",
      headline: "Die Arbeit, die Ihr Team noch von Hand macht.",
      body: "Eigene CRM-Kerne, interne Assistenten, Routing- und Freigabelogik. Wir setzen uns zuerst neben die Leute, die die Arbeit machen, denn der dokumentierte Prozess und der täglich gelebte sind meistens auseinandergelaufen. Alles läuft auf Ihrer Infrastruktur und der Quellcode gehört Ihnen.",
      metrics: [
        { value: "142", label: "PROZESSE IM PRODUKTIVBETRIEB" },
        { value: "8,4 MIO", label: "EVENTS TÄGLICH GEROUTET" },
        { value: "31 MS", label: "MEDIANE KERNEL-LATENZ" },
      ],
      cta: { label: "Automatisierungs-Audit buchen", href: "#book" },
      secondary: null,
      align: "left",
    },
    {
      id: "immersive",
      index: "02",
      label: "IMMERSIVES WEB / ECHTZEIT-3D",
      headline: "Echtzeit-3D, das auf einem vier Jahre alten Laptop noch 60 fps schafft.",
      body: "Produktkonfiguratoren, räumliche Markenarbeit, interaktive Dokumentation. Wir kalkulieren das Frame-Budget, bevor jemand ein Designtool öffnet. Ein Kontext, ein Draw-Pfad, Geometrie im Shader erzeugt statt heruntergeladen. Wenn es auf dem Rechner des Kunden ruckelt, ist es egal, wie gut es im Studio aussah.",
      metrics: [
        { value: "58,7 FPS", label: "P95, MITTELKLASSE-GPU" },
        { value: "1,9 S", label: "LARGEST CONTENTFUL PAINT" },
        { value: "41", label: "AUSGELIEFERTE WEBGL-BUILDS" },
      ],
      cta: { label: "So messen wir das", href: "#record" },
      secondary: null,
      align: "right",
    },
    {
      id: "operators",
      index: "03",
      label: "SPRACH- & CHAT-AGENTEN",
      headline: "Agenten, die auch die zweite Frage schaffen.",
      body: "Chat- und Sprachagenten, die Kontext über Kanäle hinweg behalten und wissen, wann sie übergeben müssen. Wir betreiben sie in Schichten: ein Agent für die Erstaufnahme, ein Spezialist dahinter und eine Aufsicht, die Transkripte liest. Jede Entscheidung wird protokolliert, und danach fragt Ihre Compliance-Abteilung normalerweise zuerst.",
      metrics: [
        { value: "97,3 %", label: "INTENT-ERKENNUNG, ERSTER DURCHLAUF" },
        { value: "620 MS", label: "LATENZ PRO SPRECHERWECHSEL" },
        { value: "27", label: "SPRACHEN IM EINSATZ" },
      ],
      cta: { label: "Agenten live hören", href: "#book" },
      secondary: { label: "Echte Verläufe ansehen", href: "#examples" },
      align: "left",
    },
    {
      id: "vision",
      index: "04",
      label: "BILDANALYSE & RAUMDATEN",
      headline: "Niemand hat Zeit, das Material anzusehen.",
      body: "Belegung, Wege, Arbeitssicherheit und Qualitätsprüfung. Die Inferenz läuft auf dem Gerät und nur die Zusammenfassung geht nach oben, das Video bleibt also vor Ort, solange Sie es nicht anders entscheiden. Genau dieses Detail bringt das Projekt meistens durch die Rechtsabteilung.",
      metrics: [
        { value: "1.284", label: "BETREUTE EDGE-KAMERAS" },
        { value: "99,1 %", label: "ERKENNUNGSGENAUIGKEIT" },
        { value: "6,3 W", label: "LEISTUNGSAUFNAHME PRO KNOTEN" },
      ],
      cta: { label: "Standort-Rollout planen", href: "#book" },
      secondary: null,
      align: "right",
    },
  ],

  work: {
    id: "work",
    label: "AUSGEWÄHLTE ARBEITEN",
    headline: "Ein paar, die Sie selbst öffnen können.",
    items: [
      {
        index: "01",
        name: "Cula",
        discipline: "PLATTFORM / DATEN",
        note: "Messung, Berichterstattung und Verifizierung für CO2-Entnahme, auf Basis laufender Betriebsdaten und über alle Entnahmepfade hinweg.",
        domain: "cula.tech",
        href: "https://www.cula.tech",
      },
      {
        index: "02",
        name: "Pier88 Coast",
        discipline: "GASTRONOMIE / MARKE",
        note: "Eine Küstenmarke, die ein Haus vom Aperitivo bis ins Nachtprogramm trägt.",
        domain: "pier88coast.com",
        href: "https://pier88coast.com",
      },
      {
        index: "03",
        name: "CRAV",
        discipline: "HANDEL / MARKE",
        note: "Smashed-Burger-Haus in Navarra, bei dem die Bestellung in der Markenseite steckt statt daneben zu hängen.",
        domain: "cravburgers.shop",
        href: "https://www.cravburgers.shop",
      },
    ],
  },

  conversion: {
    id: "engagement",
    label: "ZUSAMMENARBEIT",
    headline: "Beginnen Sie mit einer zweiwöchigen technischen Analyse.",
    body: "Wir lesen Ihre Systeme, instrumentieren den Prozess und kommen mit einem kalkulierten Plan zurück. Darin stehen auch die Teile, die wir nicht bauen würden. Festpreis, wird auf die erste Umsetzungsphase angerechnet.",
    cta: { label: "Analyse buchen", href: "#book" },
    secondary: { label: "Einsatzliste ansehen", href: "#record" },
    meta: [
      { value: "14 TAGE", label: "ZEITRAUM DER ANALYSE" },
      { value: "1.400 EUR", label: "FESTPREIS, ANGERECHNET" },
      { value: "3", label: "PLÄTZE PRO QUARTAL" },
    ],
  },

  panels: {
    book: {
      id: "book",
      label: "ZUSAMMENARBEIT / ANALYSE",
      title: "Die zweiwöchige Analyse.",
      intro: "Vierzehn Tage in Ihrem Betrieb, am Ende steht ein kalkulierter Umsetzungsplan, der Ihnen gehört, ob Sie uns danach beauftragen oder nicht. Alles Folgende passiert wirklich, und zwar in dieser Reihenfolge.",
      close: "Schließen",

      phases: {
        heading: "WAS PASSIERT",
        items: [
          {
            range: "TAG 1 / 2",
            title: "Zugänge und Bestandsaufnahme",
            body: "Wir bekommen Lesezugriff auf die betroffenen Systeme und schreiben auf, was tatsächlich läuft, inklusive der Tabellen und Cronjobs, für die sich niemand mehr zuständig fühlt.",
          },
          {
            range: "TAG 3 / 5",
            title: "Neben der Arbeit sitzen",
            body: "Wir sehen den Leuten bei der Arbeit zu, stoppen die manuellen Schritte und notieren jede Stelle, an der sie am Werkzeug vorbei arbeiten statt damit.",
          },
          {
            range: "TAG 6 / 8",
            title: "Instrumentierung",
            body: "Wir setzen Zähler auf die Teile, die Sie bisher nicht sehen können. Die meisten Teams schätzen ihre eigenen Mengen um den Faktor zwei falsch ein, in die eine oder die andere Richtung.",
          },
          {
            range: "TAG 9 / 11",
            title: "Kalkulation",
            body: "Jeder mögliche Baustein wird gegen die Stunden gerechnet, die er einspart, gegen die Fehlerquellen, die er mitbringt, und gegen die Betriebskosten nach unserem Abgang.",
          },
          {
            range: "TAG 12 / 14",
            title: "Die Auswertung",
            body: "Sie bekommen den Plan und eine Begehung mit Ihrem Team. Die Teile, die wir nicht bauen würden, stellen wir mit demselben Gewicht vor wie die, die wir bauen würden.",
          },
        ],
      },

      deliverables: {
        heading: "WAS SIE BEKOMMEN",
        items: [
          "Einen schriftlichen Umsetzungsplan mit den Phasen in kalkulierter Reihenfolge",
          "Ausgangswerte zu Menge, Latenz und Fehlern, gemessen statt geschätzt",
          "Eine Liste dessen, wovon wir abraten, jeweils mit Begründung",
          "Die Instrumentierung, die in Ihrer Infrastruktur bleibt und weiterläuft",
          "Eine 90-minütige Begehung mit Ihrem Team, auf Wunsch aufgezeichnet",
        ],
      },

      requirements: {
        heading: "WAS WIR VON IHNEN BRAUCHEN",
        items: [
          "Lesezugriff auf die betroffenen Systeme, erteilt in den ersten zwei Tagen",
          "Zwei Stunden mit den Leuten, die den Prozess täglich fahren",
          "Eine Person, die Fragen zum gedachten Ablauf verbindlich klären kann",
          "Eine benannte Kontaktperson für Sicherheit, sofern personenbezogene Daten betroffen sind",
        ],
      },

      terms: {
        heading: "KONDITIONEN",
        items: [
          { value: "1.400 EUR", label: "FESTPREIS, VOLL AUF PHASE EINS ANGERECHNET" },
          { value: "14 TAGE", label: "KALENDERTAGE, KEINE ABRECHNUNGSTAGE" },
          { value: "3", label: "PLÄTZE PRO QUARTAL" },
          { value: "7 TAGE", label: "KOSTENFREIE ABSAGE VOR BEGINN" },
        ],
      },

      form: {
        heading: "PLATZ ANFRAGEN",
        note: "Sagen Sie uns, was bei Ihnen läuft und wann Sie ungefähr anfangen wollen. Wir antworten innerhalb von zwei Werktagen, und wir sagen ab, wenn wir nicht das richtige Büro dafür sind.",
        submit: "Anfrage senden",
        mailto: MAIL,
        subject: "Anfrage Analyse",
        success: "Ihr Mailprogramm sollte sich mit der ausgefüllten Anfrage geöffnet haben. Falls nichts passiert ist, schicken Sie dieselben Angaben an die Adresse unten.",
        fallback: MAIL,
        fields: [
          { name: "Name", label: "NAME", type: "text", options: [], placeholder: "", required: true },
          { name: "Company", label: "UNTERNEHMEN", type: "text", options: [], placeholder: "", required: true },
          { name: "Email", label: "E-MAIL", type: "email", options: [], placeholder: "", required: true },
          {
            name: "Practice",
            label: "BEREICH",
            type: "select",
            options: [
              "Kernautomatisierung und CRM-Kerne",
              "Immersives Web und Echtzeit-3D",
              "Sprach- und Chat-Agenten",
              "Bildanalyse und Raumdaten",
              "Noch unklar",
            ],
            placeholder: "",
            required: true,
          },
          {
            name: "Start",
            label: "FRÜHESTER START",
            type: "select",
            options: ["Dieses Quartal", "Nächstes Quartal", "Später in diesem Jahr", "Noch offen"],
            placeholder: "",
            required: true,
          },
          {
            name: "Systems",
            label: "BETROFFENE SYSTEME",
            type: "textarea",
            options: [],
            placeholder: "Welche Systeme, wie viele Leute arbeiten damit, und was geht am häufigsten kaputt.",
            required: true,
          },
        ],
      },
    },

    examples: {
      id: "examples",
      label: "CHAT-AGENTEN / VERLÄUFE",
      title: "Vier Agenten, mitten im Gespräch.",
      intro: "Vier Agenten auf vier Plattformen mit vier verschiedenen Aufgaben. Der Hinweis unter jedem Bild zeigt auf die Stelle, die schwieriger ist, als sie aussieht.",
      close: "Schließen",
      items: [
        {
          index: "01",
          platform: "WHATSAPP",
          client: "Oak & Ember",
          tag: "RESTAURANT / RESERVIERUNG",
          note: "Der Gast ändert zweimal die Uhrzeit und zweimal die Personenzahl, storniert und nimmt die Stornierung zurück. Eine einzige Reservierung trägt das alles mit, und der Gast muss nie von vorn anfangen. Die Terrasse sagt der Agent bewusst nicht zu, weil sie vom Wetter abhängt.",
          alt: "Ein WhatsApp-Verlauf mit einem Reservierungsagenten. Der Gast ändert mehrfach Uhrzeit und Personenzahl, bittet um einen ruhigen Ecktisch, storniert und bucht dann doch. Der Agent bestätigt fünf Personen um 19 Uhr in der ruhigen Ecke.",
          image: "whatsapp",
          orientation: "phone",
        },
        {
          index: "02",
          platform: "MESSENGER",
          client: "Pawfect Grooming",
          tag: "TIERPFLEGE / TERMINE",
          note: "Acht einzelne Wünsche kommen über fünf Nachrichten verteilt an: eine Pflegerin mit Namen, Hafershampoo, Ohrlänge, Pfotenbad, Halstuch, die Form des Gesichtsschnitts. Alle landen in der Buchung, und die Stornoregel wird beim ersten Nachfragen beantwortet.",
          alt: "Ein Messenger-Verlauf zur Buchung eines Hundesalon-Termins. Der Halter ergänzt Wunsch für Wunsch, darunter eine namentlich genannte Pflegerin, Hafershampoo, Pfotenbad und Halstuch. Der Agent bestätigt jeden Punkt und nennt die Stornoregel.",
          image: "messenger",
          orientation: "phone",
        },
        {
          index: "03",
          platform: "DISCORD",
          client: "Mythic Realms",
          tag: "GAMES / COMMUNITY-SUPPORT",
          note: "Eine Frage zur Spielmechanik, beantwortet mit den tatsächlichen Werten, in einem öffentlichen Kanal, in dem eine falsche Antwort der ganze Server sieht. Gelesen wird aus den aktuellen Designdokumenten, nicht aus einer Zusammenfassung von vor sechs Patches.",
          alt: "Ein Discord-Kanal, in dem ein Spieler nach dem Ausdauersystem in Bosskämpfen fragt. Der Bot antwortet mit konkreten Schwellenwerten und Regenerationszeiten und ergänzt drei taktische Hinweise.",
          image: "discord",
          orientation: "wide",
        },
        {
          index: "04",
          platform: "SLACK",
          client: "Interner Vertriebsassistent",
          tag: "KONSUMGÜTER / INTERN",
          note: "Drei Personen stellen in einem Thread Rückfragen, und der regionale Kontext trägt über alle hinweg. Wo die Antwort eine Tabelle ist, kommt eine Tabelle. Eine Wettbewerbsaktion wird samt Empfehlung markiert, und auf Zuruf entsteht ein versandfertiger Textentwurf.",
          alt: "Ein Slack-Kanal, in dem drei Kolleginnen und Kollegen einen Vertriebsassistenten nach dem Absatz in der Westregion fragen. Er antwortet mit einer Tabelle nach Bundesstaat, einer Einschätzung zur Rabattaktion des Wettbewerbs und einem Textentwurf für Kunden.",
          image: "slack",
          orientation: "wide",
        },
      ],
      outro: "Jeder davon läuft im Konto des Kunden, auf der Plattform, die dessen Kundschaft ohnehin benutzt. Wir bauen den Agenten, verbinden ihn mit den Systemen, in denen die Antworten liegen, und betreiben ihn danach.",
      cta: { label: "Über einen Agenten sprechen", href: "#book" },
    },

    record: {
      id: "record",
      label: "ZUSAMMENARBEIT / NACHWEIS",
      title: "Einsatzliste.",
      intro: "Jedes System, das wir seit 2019 in den Produktivbetrieb gebracht haben, mit der Kennzahl, an der der Kunde es gemessen hat. Kunden stehen als Branche darin, weil die meisten dieser Verträge den Namen nicht erlauben. Wird zum Quartalsende aktualisiert.",
      close: "Schließen",

      table: {
        heading: "IM PRODUKTIVBETRIEB",
        columns: ["JAHR", "KUNDE", "BEREICH", "UMFANG", "ERGEBNIS", "STATUS"],
        rows: [
          { year: "2025", client: "Industrielogistik-Gruppe", practice: "Automatisierung", scope: "Disponierkern, 6 Standorte", result: "31 ms p50", status: "Läuft" },
          { year: "2025", client: "Energiemessdienstleister", practice: "Bildanalyse", scope: "Zählerablesung per Mastkamera, 940 Stück", result: "99,1 % Genauigkeit", status: "Läuft" },
          { year: "2024", client: "Medizintechnik-Hersteller", practice: "Automatisierung", scope: "Reklamationsannahme und Sichtung", result: "4.180 Fälle / Mon", status: "Läuft" },
          { year: "2024", client: "Regionalversicherer", practice: "Agenten", scope: "Schadenchat erste Linie, 3 Sprachen", result: "97,3 % erster Lauf", status: "Läuft" },
          { year: "2024", client: "Hafenbehörde", practice: "Bildanalyse", scope: "Kajbelegung und Sicherheitszonen", result: "1.284 Kameras", status: "Läuft" },
          { year: "2023", client: "Großhandel", practice: "Automatisierung", scope: "Auftragserfassung aus PDF und E-Mail", result: "8,4 Mio Events / Tag", status: "Läuft" },
          { year: "2023", client: "Verkehrsbetrieb", practice: "Agenten", scope: "Sprachlinie bei Störungen", result: "620 ms Wechsel", status: "Läuft" },
          { year: "2023", client: "Spezialchemie", practice: "Plattform", scope: "Oberfläche für Chargenprotokolle", result: "2,1 s LCP", status: "Läuft" },
          { year: "2022", client: "Gebäudedienstleister", practice: "Automatisierung", scope: "Auftragsdisposition, 40 Kolonnen", result: "Keine vereinbarte Kennzahl", status: "Übergeben" },
          { year: "2022", client: "Möbelhersteller", practice: "Immersiv", scope: "Produktkonfigurator, 40 Artikel", result: "58,7 fps p95", status: "Übergeben" },
          { year: "2021", client: "Landwirtschaftliche Genossenschaft", practice: "Bildanalyse", scope: "Sichtprüfung an der Sortierlinie", result: "6,3 W pro Knoten", status: "Abgeschaltet" },
          { year: "2020", client: "Druckereigruppe", practice: "Automatisierung", scope: "Angebotserstellung aus Datenblättern", result: "Keine vereinbarte Kennzahl", status: "Abgeschaltet" },
        ],
      },

      method: {
        heading: "WIE DIESE ZAHLEN ENTSTEHEN",
        items: [
          {
            term: "Im Produktivbetrieb",
            body: "Trägt seit mindestens 30 zusammenhängenden Tagen echten Verkehr für einen zahlenden Kunden. Pilotprojekte und Machbarkeitsnachweise stehen nicht auf dieser Liste, so gut sie auch gelaufen sind.",
          },
          {
            term: "Latenz",
            body: "Gemessen an der Dienstgrenze innerhalb unserer eigenen Infrastruktur, also ohne Kundennetz und ohne Browser. p50 und p95 über rollierende 30 Tage.",
          },
          {
            term: "Erkennungsgenauigkeit",
            body: "Richtige Treffer im Verhältnis zu allen Meldungen, monatlich geprüft gegen 2.000 von Hand beschriftete Bilder von genau diesem Standort statt aus einem Benchmark.",
          },
          {
            term: "Keine vereinbarte Kennzahl",
            body: "Wir haben übergeben, bevor der Kunde und wir uns auf eine Zahl geeinigt hatten. Werte, die wir damals nicht gemessen haben, tragen wir nicht nachträglich ein.",
          },
          {
            term: "Abgeschaltet",
            body: "Der Kunde hat den Dienst eingestellt oder ersetzt. Die Zeile bleibt in der Liste.",
          },
        ],
      },

      incidents: {
        heading: "STÖRUNGEN, LETZTE 24 MONATE",
        items: [
          { value: "4", label: "STÖRUNGEN DER STUFE EINS" },
          { value: "71 MIN", label: "LÄNGSTER EINZELAUSFALL" },
          { value: "100 %", label: "AUFGEARBEITET UND AN DEN KUNDEN GESCHICKT" },
        ],
      },
    },
  },

  footer: {
    columns: [
      {
        heading: "BEREICHE",
        items: [
          { label: "Kernautomatisierung", href: "#automation" },
          { label: "Immersives Web", href: "#immersive" },
          { label: "Sprache und Chat", href: "#operators" },
          { label: "Bildanalyse", href: "#vision" },
        ],
      },
      {
        heading: "STANDORTE",
        items: [
          { label: "Hamburg, Hammerbrook", href: "#engagement" },
          { label: "Rotterdam, Katendrecht", href: "#engagement" },
        ],
      },
      {
        heading: "KONTAKT",
        items: [
          { label: MAIL, href: `mailto:${MAIL}` },
          { label: "Einsatzliste", href: "#record" },
        ],
      },
    ],
    rule: "NORDWERK SYSTEMS GMBH",
    note: "ALLE SYSTEME WERDEN MIT QUELLCODE ÜBERGEBEN",
  },
};

export const content: Record<Locale, Content> = { en, de };
