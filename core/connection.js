
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

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
  fetchLatestBaileysVersion,
  Browsers
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
        `Using WhatsApp version: ${version.join(".")}`
      );
    }
  } catch (error) {
    logger.warn(
      `WhatsApp version check failed: ${error.message}`
    );
  }

  const sock = makeWASocket({
    ...(version ? { version } : {}),

    auth: state,

    logger: pino({
      level: "silent"
    }),

    printQRInTerminal: false,

    browser: Browsers
      ? Browsers.ubuntu("Chrome")
      : ["Ubuntu", "Chrome", "20.0.0"],

    markOnlineOnConnect: false,

    syncFullHistory: false,

    connectTimeoutMs: 60000,

    defaultQueryTimeoutMs: 60000,

    keepAliveIntervalMs: 25000
  });

  sock.ev.on("creds.update", saveCreds);

  // Existing registered session: do not request another code.
  if (state.creds.registered) {
    logger.success("Existing WhatsApp session detected.");
    logger.info(
      "Pairing code is not required for this registered session."
    );

    return sock;
  }

  const phoneNumber = String(
    CONFIG.BOT_PHONE_NUMBER || ""
  ).replace(/\D/g, "");

  if (!phoneNumber) {
    logger.error(
      "BOT_PHONE_NUMBER is missing in config.js"
    );

    return sock;
  }

  let pairingTimer = null;
  let pairingStarted = false;

  const clearPairingTimer = () => {
    if (pairingTimer) {
      clearTimeout(pairingTimer);
      pairingTimer = null;
    }
  };

  const startPairing = async () => {
    if (pairingStarted || state.creds.registered) {
      return;
    }

    pairingStarted = true;
    clearPairingTimer();

    try {
      logger.info("Requesting WhatsApp pairing code...");

      const code = await requestPairing(sock);

      if (!code) {
        logger.error(
          "Pairing code was not generated. Check the connection and phone number."
        );
        return;
      }

      logger.success("PAIRING CODE GENERATED");
      logger.info(`CODE: ${code}`);

    } catch (error) {
      logger.error(
        "Pairing code request failed:",
        error
      );
    }
  };

  // Wait briefly for the socket to initialize.
  logger.info(
    "Waiting before requesting WhatsApp pairing code..."
  );

  pairingTimer = setTimeout(() => {
    startPairing();
  }, 8000);

  // Stop the pending request if the connection opens or closes.
  sock.ev.on("connection.update", update => {
    if (
      update.connection === "open" ||
      update.connection === "close"
    ) {
      clearPairingTimer();
    }
  });

  return sock;
}
