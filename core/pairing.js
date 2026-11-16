
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে।

import { CONFIG } from "../config.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

let pairingRequested = false;

export async function requestPairing(sock) {
  if (pairingRequested) return null;

  const phoneNumber = CONFIG.BOT_PHONE_NUMBER;

  if (!phoneNumber) {
    logger.error("Phone number is missing in configuration.");
    return null;
  }

  if (!sock || typeof sock.requestPairingCode !== "function") {
    logger.error("Pairing is not available on this connection.");
    return null;
  }

  try {
    pairingRequested = true;

    logger.info(`Generating pairing code for ${phoneNumber}`);

    const code = await sock.requestPairingCode(phoneNumber);

    logger.success("WhatsApp Pairing Code:");
    logger.info(code);

    return code;

  } catch (error) {
    pairingRequested = false;
    logger.error("Pairing code request failed", error);
    return null;
  }
}
