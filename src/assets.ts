import whatsapp from "./assets/agent-whatsapp.jpg";
import messenger from "./assets/agent-messenger.jpg";
import discord from "./assets/agent-discord.jpg";
import slack from "./assets/agent-slack.jpg";

/**
 * Agent transcript screenshots, keyed by the string `content.ts` carries.
 *
 * The indirection exists so content.ts stays free of image imports: plain Node
 * loads that module for the copy audit and cannot resolve a .jpg specifier.
 * Vite emits these as files for a normal build and inlines them as data URIs
 * for the single-file build, so neither output needs a separate asset host.
 *
 * Intrinsic sizes travel with the source so the markup can reserve the space
 * before the bytes arrive; without them a lazily loaded shot collapses to zero
 * height and everything below it jumps when it loads.
 */
export interface Shot {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export const SHOTS: Record<string, Shot> = {
  whatsapp: { src: whatsapp, width: 660, height: 990 },
  messenger: { src: messenger, width: 660, height: 990 },
  discord: { src: discord, width: 1060, height: 707 },
  slack: { src: slack, width: 1060, height: 678 },
};
