
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে।

import fs from "fs-extra";
import pino from "pino";

import makeWASocket, {
  useMultiFileAuthState
} from "@whiskeysockets/baileys";

import { CONFIG } from "../config.js";
import { requestPairing } from "./pairing.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

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

    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  // Save authentication credentials
  sock.ev.on("creds.update", saveCreds);

  let pairingStarted = false;

  // Request pairing only when WhatsApp socket is ready
  sock.ev.on("connection.update", async (update) => {
    const { qr, connection } = update;

    if (
      connection === "open"
    ) {
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
      logger.error(
        "BOT_PHONE_NUMBER is missing. Check your .env file."
      );
      return;
    }

    pairingStarted = true;

    logger.info(
      "WhatsApp is ready. Requesting pairing code..."
    );

    try {
      const code = await requestPairing(sock);

      if (!code) {
        pairingStarted = false;

        logger.warn(
          "Pairing code was not generated. Check the error above."
        );
      }
    } catch (error) {
      pairingStarted = false;

      logger.error(
        "Pairing code generation failed",
        error
      );
    }
  });

  if (
    !state.creds.registered &&
    !CONFIG.BOT_PHONE_NUMBER
  ) {
    logger.error(
      "Please configure BOT_PHONE_NUMBER in .env"
    );
  }

  return sock;
}
