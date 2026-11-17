// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import { CONFIG, isOwner } from "../config.js";
import { handleCommand } from "./commandHandler.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

function unwrapMessage(message) {
  let current = message;

  for (let i = 0; i < 8; i++) {
    if (!current) break;

    const next =
      current.ephemeralMessage?.message ||
      current.viewOnceMessage?.message ||
      current.viewOnceMessageV2?.message ||
      current.viewOnceMessageV2Extension?.message ||
      current.documentWithCaptionMessage?.message;

    if (!next) break;

    current = next;
  }

  return current;
}

function getMessageText(message) {
  const content = unwrapMessage(message?.message);

  if (!content) return "";

  return String(
    content.conversation ||
    content.extendedTextMessage?.text ||
    content.imageMessage?.caption ||
    content.videoMessage?.caption ||
    content.documentMessage?.caption ||
    content.buttonsResponseMessage?.selectedButtonId ||
    content.listResponseMessage?.singleSelectReply?.selectedRowId ||
    content.templateButtonReplyMessage?.selectedId ||
    content.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
    ""
  ).trim();
}

function getContextInfo(message) {
  const content = unwrapMessage(message?.message);

  if (!content) return null;

  const messageTypes = [
    "extendedTextMessage",
    "imageMessage",
    "videoMessage",
    "documentMessage",
    "audioMessage",
    "stickerMessage",
    "buttonsResponseMessage",
    "listResponseMessage",
    "templateButtonReplyMessage"
  ];

  for (const type of messageTypes) {
    const info = content[type]?.contextInfo;

    if (info) return info;
  }

  return null;
}

function getQuotedMessageId(message) {
  return getContextInfo(message)?.stanzaId || null;
}

function getSender(message, isGroup) {
  if (isGroup) {
    return (
      message.key?.participant ||
      message.participant ||
      ""
    );
  }

  return (
    message.key?.remoteJidAlt ||
    message.key?.remoteJid ||
    ""
  );
}

export function handleMessages(sock) {
  if (!sock?.ev) {
    throw new Error("Invalid WhatsApp socket passed to handleMessages()");
  }

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify" && type !== "append") return;

    for (const message of messages || []) {
      try {
        if (!message?.message || !message.key) continue;

        const jid = message.key.remoteJid;

        if (!jid || jid === "status@broadcast") continue;

        const isGroup = jid.endsWith("@g.us");

        const rawSenderJid = getSender(message, isGroup);

        const senderAltJid = isGroup
          ? (
              message.key.participantAlt ||
              message.participantAlt ||
              ""
            )
          : (
              message.key.remoteJidAlt ||
              ""
            );

        const mainOwner = isOwner(
          rawSenderJid,
          senderAltJid
        );

        // Bot নিজের পাঠানো মেসেজ পুনরায় কমান্ড হিসেবে চালাবে না।
        if (message.key.fromMe) continue;

        if (!rawSenderJid) continue;

        const senderJid = mainOwner
          ? (
              isOwner(senderAltJid)
                ? senderAltJid
                : rawSenderJid
            )
          : rawSenderJid;

        const senderUid = rawSenderJid;

        if (isGroup && !CONFIG.ALLOW_GROUP && !mainOwner) {
          continue;
        }

        if (!isGroup && !CONFIG.ALLOW_INBOX && !mainOwner) {
          continue;
        }

        const contextInfo = getContextInfo(message);

        const context = {
          sock,
          message,
          body: getMessageText(message),
          jid,
          senderJid,
          senderUid,
          senderAltJid,
          isGroup,
          isOwner: mainOwner,
          pushName: message.pushName || "User",
          quotedMessageId: getQuotedMessageId(message),
          quotedMessage: contextInfo?.quotedMessage || null,
          mentionedJid: contextInfo?.mentionedJid || [],

          reply: async text => {
            return sock.sendMessage(
              jid,
              {
                text: String(text ?? "")
              },
              {
                quoted: message
              }
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

export default handleMessages;
