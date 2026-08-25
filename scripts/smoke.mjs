/**
 * Dev-only verification harness. Not a gate.
 *
 * Serves ./dist, drives headless Chromium over CDP using Node's built-in
 * WebSocket (no extra dependencies), collects console output and page
 * exceptions — which is where three.js reports shader compile errors — and
 * captures screenshots at a set of scroll positions.
 *
 *   node scripts/smoke.mjs [--positions 0,0.35,0.68,0.95] [--out .smoke]
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { extname, join, normalize } from "node:path";

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const POSITIONS = argOf("positions", "0,0.35,0.68,0.97").split(",").map(Number);
const OUT_DIR = argOf("out", ".smoke");
const VIEWPORT = { width: 1440, height: 900 };
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".ico": "image/x-icon",
};

async function serveDist() {
  const root = new URL("../dist/", import.meta.url).pathname;
  const server = createServer(async (req, res) => {
    const url = (req.url || "/").split("?")[0];
    const rel = normalize(url === "/" ? "/index.html" : url).replace(/^(\.\.[/\\])+/, "");
    try {
      const body = await readFile(join(root, rel));
      res.writeHead(200, { "content-type": MIME[extname(rel)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, port: server.address().port };
}

async function waitForTarget(port) {
  for (let i = 0; i < 100; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("chromium devtools endpoint never came up");
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  const listeners = [];
  let nextId = 1;
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", () => resolve());
    ws.addEventListener("error", () => reject(new Error("cdp socket error")));
  });
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    } else if (msg.method) {
      for (const fn of listeners) fn(msg);
    }
  });
  return {
    ready,
    on: (fn) => listeners.push(fn),
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      }),
    close: () => ws.close(),
  };
}

function textOf(arg) {
  if (arg.value !== undefined) return String(arg.value);
  if (arg.description) return arg.description;
  return arg.type;
}

const { server, port } = await serveDist();
const pageUrl = `http://127.0.0.1:${port}/`;
const debugPort = 9222 + (process.pid % 500);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--hide-scrollbars",
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    "--user-data-dir=/tmp/smoke-profile",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);
chrome.stderr.on("data", () => {});

const messages = [];
let exitCode = 0;

try {
  const client = cdp(await waitForTarget(debugPort));
  await client.ready;

  client.on((msg) => {
    if (msg.method === "Runtime.consoleAPICalled") {
      messages.push({
        level: msg.params.type,
        text: (msg.params.args || []).map(textOf).join(" "),
      });
    } else if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      messages.push({ level: "exception", text: d.exception?.description || d.text });
    } else if (msg.method === "Log.entryAdded") {
      messages.push({ level: msg.params.entry.level, text: msg.params.entry.text });
    }
  });

  await client.send("Runtime.enable");
  await client.send("Log.enable");
  await client.send("Page.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    ...VIEWPORT,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await client.send("Page.navigate", { url: pageUrl });
  await new Promise((r) => setTimeout(r, 3500));

  await mkdir(OUT_DIR, { recursive: true });
  for (const p of POSITIONS) {
    await client.send("Runtime.evaluate", {
      expression: `window.scrollTo(0, (document.body.scrollHeight - innerHeight) * ${p});`,
      awaitPromise: false,
    });
    await new Promise((r) => setTimeout(r, 2200));
    const shot = await client.send("Page.captureScreenshot", { format: "png" });
    const name = join(OUT_DIR, `p${String(Math.round(p * 100)).padStart(3, "0")}.png`);
    await writeFile(name, Buffer.from(shot.data, "base64"));
    console.log(`  captured ${name}`);
  }

  const probe = await client.send("Runtime.evaluate", {
    expression: `(() => {
      const c = document.querySelector('#gl');
      if (!c) return 'NO CANVAS';
      const ctx = c.getContext('webgl2') || c.getContext('webgl');
      return JSON.stringify({
        canvas: c.width + 'x' + c.height,
        css: c.clientWidth + 'x' + c.clientHeight,
        contextLost: ctx ? ctx.isContextLost() : 'no-context',
        scrollHeight: document.body.scrollHeight,
      });
    })()`,
    returnByValue: true,
  });
  console.log(`  probe: ${probe.result.value}`);

  client.close();
} catch (err) {
  console.error(`smoke: harness error — ${err.message}`);
  exitCode = 1;
} finally {
  chrome.kill("SIGKILL");
  server.close();
}

const bad = messages.filter(
  (m) => m.level === "error" || m.level === "exception" || /shader|WebGL|THREE\./i.test(m.text),
);

if (messages.length) {
  console.log(`\n  ${messages.length} console message(s):`);
  for (const m of messages.slice(0, 30)) console.log(`    [${m.level}] ${m.text.slice(0, 700)}`);
}

if (bad.length) {
  console.error(`\nsmoke: FAIL — ${bad.length} error/shader message(s)`);
  exitCode = 1;
} else if (exitCode === 0) {
  console.log("\nsmoke: PASS — no console errors, no shader errors");
}

process.exit(exitCode);
