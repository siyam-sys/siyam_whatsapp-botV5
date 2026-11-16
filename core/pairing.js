// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে।

import { CONFIG } from "../config.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

// একই connection থেকে বারবার কোড তৈরি হওয়া আটকাবে।
const pairingRequested = new WeakSet();

export async function requestPairing(sock) {
  if (!sock || pairingRequested.has(sock)) {
    return null;
  }

  const phoneNumber = CONFIG.BOT_PHONE_NUMBER;

  if (!phoneNumber) {
    logger.error("Phone number is missing in configuration.");
    return null;
  }

  if (typeof sock.requestPairingCode !== "function") {
    logger.error("Pairing is not available on this connection.");
    return null;
  }

  try {
    pairingRequested.add(sock);

    logger.info(`Generating pairing code for ${phoneNumber}`);

    const code = await sock.requestPairingCode(phoneNumber);

    if (!code) {
      pairingRequested.delete(sock);
      logger.error("WhatsApp returned an empty pairing code.");
      return null;
    }

    logger.success("WhatsApp Pairing Code:");
    logger.info(code);

    return code;

  } catch (error) {
    pairingRequested.delete(sock);
    logger.error("Pairing code request failed", error);
    return null;
  }
}
