
 // AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে।

import fs from "fs-extra";
import pino from "pino";

import * as baileys from "@whiskeysockets/baileys";

import { CONFIG } from "../config.js";
import { requestPairing } from "./pairing.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

// Compatible Baileys export resolver
const defaultExport = baileys.default;

const makeWASocket =
  typeof defaultExport === "function"
    ? defaultExport
    : typeof defaultExport?.default === "function"
      ? defaultExport.default
      : typeof baileys.makeWASocket === "function"
        ? baileys.makeWASocket
        : null;

const useMultiFileAuthState =
  baileys.useMultiFileAuthState ||
  defaultExport?.useMultiFileAuthState;

if (typeof makeWASocket !== "function") {
  throw new Error(
    "Baileys socket export is not a function. Check installed package version."
  );
}

if (typeof useMultiFileAuthState !== "function") {
  throw new Error(
    "Baileys useMultiFileAuthState export is missing."
  );
}

export async function connectToWhatsApp() {
  await fs.ensureDir(CONFIG.SESSION_DIR);

  const { state, saveCreds } =
    await useMultiFileAuthState(CONFIG.SESSION_DIR);

  const sock = makeWASocket({
    auth: state,

    logger: pino({
      level: "silent"
    }),

    browser: [
      CONFIG.BOT_NAME,
      "Chrome",
      CONFIG.VERSION
    ],

    printQRInTerminal: false,
    markOnlineOnConnect: false,
    syncFullHistory: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000
  });

  // Save authentication credentials
  sock.ev.on("creds.update", saveCreds);

  let pairingStarted = false;

  // Wait for WhatsApp connection update
  sock.ev.on("connection.update", async (update) => {
    const { qr, connection } = update;

    if (connection === "open") {
      pairingStarted = true;
      return;
    }

    if (
      !qr ||
      state.creds.registered ||
      !CONFIG.PAIRING.ENABLED ||
      pairingStarted
    ) {
      return;
    }

    if (!CONFIG.BOT_PHONE_NUMBER) {
      logger.error("Bot phone number is missing.");
      return;
    }

    pairingStarted = true;

    logger.info("WhatsApp is ready for pairing.");

    try {
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

      logger.error(
        "Pairing request failed",
        error
      );
    }
  });

  return sock;
}
