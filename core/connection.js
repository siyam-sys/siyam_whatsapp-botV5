
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
    logger: pino({ level: "silent" }),
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

  let pairingStarted = false;

  const startPairing = async () => {
    if (pairingStarted || state.creds.registered) return;

    pairingStarted = true;
    await requestPairing(sock);
  };

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "connecting" && !state.creds.registered) {
      logger.info(
        `WhatsApp connecting for ${CONFIG.BOT_PHONE_NUMBER}`
      );
      void startPairing();
    }

    if (connection === "open") {
      logger.success("WhatsApp connection opened");
    }

    if (connection === "close") {
      const status =
        lastDisconnect?.error?.output?.statusCode;

      logger.warn(
        `WhatsApp socket closed. Status: ${status ?? "unknown"}`
      );
    }
  });

  // Fallback: connecting event না এলে ৫ সেকেন্ড পরে চেষ্টা করবে।
  setTimeout(() => {
    if (!state.creds.registered) {
      void startPairing();
    }
  }, 5000);

  return sock;
    }
        
