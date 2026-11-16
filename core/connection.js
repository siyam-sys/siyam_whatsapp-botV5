// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে।

import fs from "fs-extra";
import pino from "pino";

import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import { CONFIG } from "../config.js";
import { requestPairing } from "./pairing.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

export async function connectToWhatsApp() {
  await fs.ensureDir(CONFIG.SESSION_DIR);

  const { state, saveCreds } =
    await useMultiFileAuthState(CONFIG.SESSION_DIR);

  let version;

  try {
    const result = await fetchLatestBaileysVersion();
    version = result.version;
  } catch (error) {
    logger.warn("Could not fetch latest WhatsApp version");
  }

  const sock = makeWASocket({
    ...(version ? { version } : {}),
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

  if (!state.creds.registered && CONFIG.BOT_PHONE_NUMBER) {
    logger.info(
      `Pairing code will be generated in 30 seconds for: ${CONFIG.BOT_PHONE_NUMBER}`
    );

    setTimeout(async () => {
      if (!state.creds.registered) {
        await requestPairing(sock);
      }
    }, 30000);

  } else if (!state.creds.registered) {
    logger.error("BOT_PHONE_NUMBER is missing.");
  }

  return sock;
    }
