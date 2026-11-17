
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

  // Save credentials whenever WhatsApp updates them.
  sock.ev.on("creds.update", saveCreds);

  // Existing valid session does not need a new pairing code.
  if (state.creds.registered) {
    logger.success("Existing WhatsApp session detected.");

    return sock;
  }

  const phoneNumber = String(
    CONFIG.BOT_PHONE_NUMBER || ""
  ).replace(/\D/g, "");

  if (!phoneNumber) {
    logger.error("BOT_PHONE_NUMBER is missing.");
    return sock;
  }

  let pairingStarted = false;

  // Request a pairing code only when Baileys signals readiness.
  sock.ev.on("connection.update", async update => {
    const { connection, qr, lastDisconnect } = update;

    if (
      !state.creds.registered &&
      !pairingStarted &&
      (connection === "connecting" || Boolean(qr))
    ) {
      pairingStarted = true;

      try {
        logger.info(
          `Requesting pairing code for ${phoneNumber}`
        );

        const code = await requestPairing(sock);

        if (!code) {
          logger.error(
            "Pairing code generation failed."
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
    }

    if (connection === "open") {
      logger.success("WhatsApp connection opened.");
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode;

      logger.warn(
        `WhatsApp connection closed. Status: ${
          statusCode ?? "unknown"
        }`
      );

      if (statusCode === 401) {
        logger.error(
          "WhatsApp authentication rejected. A fresh login is required."
        );
      }
    }
  });

  logger.info(
    "Waiting for WhatsApp connection readiness..."
  );

  return sock;
}
