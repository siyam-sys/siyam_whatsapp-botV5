
import fs from "fs-extra";
import pino from "pino";

import * as baileys from "@whiskeysockets/baileys";

import { CONFIG } from "../config.js";
import { requestPairing } from "./pairing.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

const makeWASocket =
  baileys.makeWASocket || baileys.default;

const {
  useMultiFileAuthState,
  fetchLatestWaWebVersion,
  fetchLatestBaileysVersion,
  Browsers
} = baileys;

if (typeof makeWASocket !== "function") {
  throw new Error("Baileys makeWASocket export unavailable");
}

async function getWhatsAppVersion() {
  try {
    const live = await fetchLatestWaWebVersion({
      timeout: 15000
    });

    if (
      live?.isLatest &&
      Array.isArray(live.version) &&
      live.version.length === 3
    ) {
      logger.success(
        `Using live WhatsApp version: ${live.version.join(".")}`
      );

      return live.version;
    }
  } catch (error) {
    logger.warn("Live WhatsApp version fetch failed.");
  }

  try {
    const fallback = await fetchLatestBaileysVersion({
      timeout: 15000
    });

    if (
      Array.isArray(fallback.version) &&
      fallback.version.length === 3
    ) {
      logger.warn(
        `Using Baileys fallback version: ${fallback.version.join(".")}`
      );

      return fallback.version;
    }
  } catch (error) {
    logger.error("Baileys version fetch failed.", error);
  }

  throw new Error(
    "Unable to obtain a WhatsApp Web version."
  );
}

export async function connectToWhatsApp() {
  await fs.ensureDir(CONFIG.SESSION_DIR);

  const version = await getWhatsAppVersion();

  const { state, saveCreds } =
    await useMultiFileAuthState(CONFIG.SESSION_DIR);

  const sock = makeWASocket({
    version,

    auth: state,

    logger: pino({
      level: "silent"
    }),

    browser: Browsers.macOS("Chrome"),

    markOnlineOnConnect: false,
    syncFullHistory: false,

    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000
  });

  sock.ev.on("creds.update", saveCreds);

  let pairingStarted = false;

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection } = update;

    if (connection === "open") {
      pairingStarted = true;
      return;
    }

    if (
      !qr ||
      state.creds.registered ||
      !CONFIG.PAIRING?.ENABLED ||
      pairingStarted
    ) {
      return;
    }

    if (!CONFIG.BOT_PHONE_NUMBER) {
      logger.error("Bot phone number is missing.");
      return;
    }

    pairingStarted = true;

    try {
      logger.info("Requesting WhatsApp pairing code...");

      const code = await requestPairing(sock);

      if (!code) {
        pairingStarted = false;
        logger.error("Pairing code generation failed.");
        return;
      }

      logger.success("PAIRING CODE GENERATED");
      logger.info(code);

    } catch (error) {
      pairingStarted = false;

      logger.error("Pairing request failed.", error);
    }
  });

  return sock;
                                                          }
   
