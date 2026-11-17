
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
  fetchLatestBaileysVersion
} = baileys;

if (typeof makeWASocket !== "function") {
  throw new Error("Baileys makeWASocket export unavailable");
}

export async function connectToWhatsApp() {
  await fs.ensureDir(CONFIG.SESSION_DIR);

  const { state, saveCreds } =
    await useMultiFileAuthState(CONFIG.SESSION_DIR);

  let version;

  try {
    const result = await fetchLatestBaileysVersion();

    if (
      Array.isArray(result?.version) &&
      result.version.length === 3
    ) {
      version = result.version;

      logger.success(
        `Using Baileys WhatsApp version: ${version.join(".")}`
      );
    }
  } catch (error) {
    logger.warn(
      `Could not fetch WhatsApp version: ${error.message}`
    );
  }

  const sock = makeWASocket({
    ...(version ? { version } : {}),

    auth: state,

    logger: pino({
      level: "silent"
    }),

    printQRInTerminal: false,

    browser: [
      CONFIG.BOT_NAME,
      "Chrome",
      CONFIG.VERSION
    ],

    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  sock.ev.on("creds.update", saveCreds);

  if (!state.creds.registered && CONFIG.BOT_PHONE_NUMBER) {
    logger.info(
      `Pairing code will be generated in 30 seconds for: ${CONFIG.BOT_PHONE_NUMBER}`
    );

    setTimeout(async () => {
      if (state.creds.registered) {
        logger.info("WhatsApp account is already registered.");
        return;
      }

      try {
        logger.info("Requesting WhatsApp pairing code...");

        const code = await requestPairing(sock);

        if (code) {
          logger.success("PAIRING CODE GENERATED");
          logger.info(code);
        } else {
          logger.error("Pairing code generation failed.");
        }
      } catch (error) {
        logger.error("Pairing request failed:", error);
      }
    }, 30000);

  } else if (!state.creds.registered) {
    logger.error("BOT_PHONE_NUMBER is missing.");
  }

  return sock;
}
