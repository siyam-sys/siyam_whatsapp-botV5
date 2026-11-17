
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import { CONFIG } from "../config.js";
import { handleCommand } from "./commandHandler.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

function unwrapMessage(message) {
  let current = message;

  for (let i = 0; i < 5; i++) {
    if (!current) break;

    const next =
      current.ephemeralMessage?.message ||
      current.viewOnceMessage?.message ||
      current.viewOnceMessageV2?.message ||
      current.documentWithCaptionMessage?.message;

    if (!next) break;

    current = next;
  }

  return current;
}

function getMessageText(message) {
  const content = unwrapMessage(message?.message);

  if (!content) return "";

  return (
    content.conversation ||
    content.extendedTextMessage?.text ||
    content.imageMessage?.caption ||
    content.videoMessage?.caption ||
    content.documentMessage?.caption ||
    content.buttonsResponseMessage?.selectedButtonId ||
    content.listResponseMessage?.singleSelectReply?.selectedRowId ||
    content.templateButtonReplyMessage?.selectedId ||
    ""
  ).trim();
}

function getQuotedMessageId(message) {
  const content = unwrapMessage(message?.message);

  if (!content) return null;

  const contextInfo =
    content.extendedTextMessage?.contextInfo ||
    content.imageMessage?.contextInfo ||
    content.videoMessage?.contextInfo ||
    content.documentMessage?.contextInfo ||
    content.audioMessage?.contextInfo ||
    content.stickerMessage?.contextInfo ||
    content.buttonsResponseMessage?.contextInfo ||
    content.listResponseMessage?.contextInfo ||
    content.templateButtonReplyMessage?.contextInfo;

  return contextInfo?.stanzaId || null;
}

export function handleMessages(sock) {
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const message of messages || []) {
      try {
        if (!message?.message || message.key?.fromMe) continue;

        const jid = message.key.remoteJid;

        if (!jid || jid === "status@broadcast") continue;

        const isGroup = jid.endsWith("@g.us");

        if (isGroup && !CONFIG.ALLOW_GROUP) continue;
        if (!isGroup && !CONFIG.ALLOW_INBOX) continue;

        const body = getMessageText(message);

        if (!body) continue;

        const senderJid = isGroup
          ? message.key.participant || message.participant || ""
          : jid;

        const quotedMessageId = getQuotedMessageId(message);

        const context = {
          sock,
          message,
          body,
          jid,
          senderJid,
          isGroup,
          quotedMessageId,
          pushName: message.pushName || "User",

          reply: async text => {
            return sock.sendMessage(
              jid,
              { text: String(text) },
              { quoted: message }
            );
          }
        };

        await handleCommand(context);

      } catch (error) {
        logger.error("Message handler error", error);
      }
    }
  });
}
