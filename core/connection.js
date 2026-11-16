
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে।

import fs from "fs-extra";
import pino from "pino";

import * as Baileys from "@whiskeysockets/baileys";

import { CONFIG } from "../config.js";
import { requestPairing } from "./pairing.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

// Baileys-এর বিভিন্ন export format সামলানো
const makeWASocket =
  typeof Baileys.default === "function"
    ? Baileys.default
    : typeof Baileys.default?.default === "function"
      ? Baileys.default.default
      : Baileys.makeWASocket;

const { useMultiFileAuthState } = Baileys;

export async function connectToWhatsApp() {
  if (typeof makeWASocket !== "function") {
    throw new TypeError(
      "Baileys makeWASocket export পাওয়া যায়নি। Installed package version পরীক্ষা করুন।"
    );
  }

  if (typeof useMultiFileAuthState !== "function") {
    throw new TypeError(
      "Baileys useMultiFileAuthState export পাওয়া যায়নি।"
    );
  }

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

  if (!state.creds.registered && CONFIG.BOT_PHONE_NUMBER) {
    logger.info(
      `Pairing requested for: ${CONFIG.BOT_PHONE_NUMBER}`
    );

    setTimeout(async () => {
      if (state.creds.registered) return;

      try {
        await requestPairing(sock);
      } catch (error) {
        logger.error("Pairing startup error", error);
      }
    }, 3000);
  } else if (!state.creds.registered) {
    logger.error("BOT_PHONE_NUMBER is missing.");
  }

  return sock;
}
