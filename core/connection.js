
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
  fetchLatestWaWebVersion,
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

  // Prefer the latest WhatsApp Web version.
  try {
    const result = await fetchLatestWaWebVersion();

    if (
      result?.isLatest === true &&
      Array.isArray(result.version) &&
      result.version.length === 3
    ) {
      version = result.version;

      logger.success(
        `Using latest WhatsApp Web version: ${version.join(".")}`
      );
    } else {
      logger.warn(
        "Latest WhatsApp Web version unavailable. Trying Baileys fallback version."
      );
    }
  } catch (error) {
    logger.warn(
      `WhatsApp Web version check failed: ${error.message}`
    );
  }

  // Fallback if the WhatsApp Web version could not be fetched.
  if (!version) {
    try {
      const result = await fetchLatestBaileysVersion();

      if (
        Array.isArray(result?.version) &&
        result.version.length === 3
      ) {
        version = result.version;

        logger.warn(
          `Using Baileys fallback version: ${version.join(".")}`
        );
      }
    } catch (error) {
      logger.warn(
        `Baileys fallback version check failed: ${error.message}`
      );
    }
  }

  const socketOptions = {
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
  };

  if (version) {
    socketOptions.version = version;
  }

  const sock = makeWASocket(socketOptions);

  // Save authentication updates.
  sock.ev.on("creds.update", saveCreds);

  // Existing registered session: do not request another pairing code.
  if (state.creds.registered) {
    logger.warn(
      "Existing registered session found. Checking WhatsApp authentication."
    );

    return sock;
  }

  let pairingStarted = false;

  sock.ev.on("connection.update", async update => {
    const { connection, qr, lastDisconnect } = update;

    // Request pairing code only once for this socket.
    if (
      qr &&
      !pairingStarted &&
      !state.creds.registered
    ) {
      pairingStarted = true;

      try {
        logger.info(
          `Requesting pairing code for ${CONFIG.BOT_PHONE_NUMBER}`
        );

        const code = await requestPairing(sock);

        if (!code) {
          logger.error(
            "Pairing code request returned no code."
          );
          pairingStarted = false;
          return;
        }

        logger.success("PAIRING CODE GENERATED");
        logger.info(`CODE: ${code}`);

      } catch (error) {
        pairingStarted = false;

        logger.error(
          "Pairing code request failed:",
          error
        );
      }
    }

    if (connection === "open") {
      logger.success("WhatsApp connected successfully.");
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
          "WhatsApp rejected the saved session. A fresh login is required."
        );
      }

      if (statusCode === 408) {
        logger.warn(
          "WhatsApp connection timed out. Check network stability and WhatsApp Web version."
        );
      }
    }
  });

  logger.info(
    "Waiting for WhatsApp QR event before requesting pairing code..."
  );

  return sock;
}
