
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে।

import { CONFIG } from "../config.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

export async function requestPairing(sock) {
  const phoneNumber = String(
    CONFIG.BOT_PHONE_NUMBER || ""
  ).replace(/\D/g, "");

  if (!phoneNumber) {
    logger.error(
      "BOT_PHONE_NUMBER is missing. Use country code, digits only."
    );
    return null;
  }

  if (!sock || typeof sock.requestPairingCode !== "function") {
    logger.error(
      "This Baileys socket does not support pairing codes."
    );
    return null;
  }

  try {
    logger.info(
      `Requesting WhatsApp pairing code for ${phoneNumber}`
    );

    const code = await sock.requestPairingCode(phoneNumber);

    logger.success("WhatsApp Pairing Code generated:");
    logger.info(code);

    return code;

  } catch (error) {
    logger.error("Pairing code request failed", error);
    return null;
  }
}
