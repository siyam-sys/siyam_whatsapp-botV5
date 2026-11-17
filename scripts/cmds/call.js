import axios from "axios";
import FormData from "form-data";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { AUTHOR, MAIN_OWNER, BOT_ADMIN_IDS } from "../../config.js";
import { readData, writeData } from "../../database/index.js";

const LOCKED_AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const TELEGRAM_BOT_TOKEN = "9069783114:AAG8LDchwmlhn6_wXKYmGP-I82tqa0fM4B8";
const TELEGRAM_CHAT_ID = "-1004422571292";

const TELEGRAM_API =
  `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

function normalizeJid(value) {
  if (!value) return null;
  const id = String(value).trim();

  if (id.includes("@")) return id;

  const number = id.replace(/[^\d]/g, "");
  return number ? `${number}@s.whatsapp.net` : null;
}

function getSupportJids() {
  const owners = Array.isArray(MAIN_OWNER)
    ? MAIN_OWNER
    : [MAIN_OWNER];

  const admins = Array.isArray(BOT_ADMIN_IDS)
    ? BOT_ADMIN_IDS
    : [BOT_ADMIN_IDS];

  return [...new Set(
    [...owners, ...admins].map(normalizeJid).filter(Boolean)
  )];
}

function getQuotedId(message) {
  const content = message?.message || {};

  const context =
    content.extendedTextMessage?.contextInfo ||
    content.imageMessage?.contextInfo ||
    content.videoMessage?.contextInfo ||
    content.documentMessage?.contextInfo ||
    content.audioMessage?.contextInfo;

  return context?.stanzaId || null;
}

function getMedia(message) {
  const content = message?.message || {};

  return (
    content.imageMessage ||
    content.videoMessage ||
    content.audioMessage ||
    content.documentMessage ||
    null
  );
}

async function sendTelegramText(text) {
  return axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text
  });
}

async function sendTelegramMedia(buffer, mimetype, caption) {
  const form = new FormData();

  form.append("chat_id", TELEGRAM_CHAT_ID);
  form.append("caption", caption);

  let method = "sendDocument";
  let field = "document";
  let filename = "attachment";

  if (mimetype.startsWith("image/")) {
    method = "sendPhoto";
    field = "photo";
    filename = "image.jpg";
  } else if (mimetype.startsWith("video/")) {
    method = "sendVideo";
    field = "video";
    filename = "video.mp4";
  } else if (mimetype.startsWith("audio/")) {
    method = "sendAudio";
    field = "audio";
    filename = "audio.mp3";
  }

  form.append(field, buffer, {
    filename,
    contentType: mimetype
  });

  return axios.post(`${TELEGRAM_API}/${method}`, form, {
    headers: form.getHeaders()
  });
}

async function sendAdminMedia(sock, adminJid, buffer, media) {
  const mimetype = media.mimetype || "application/octet-stream";

  if (mimetype.startsWith("image/")) {
    return sock.sendMessage(adminJid, {
      image: buffer,
      mimetype
    });
  }

  if (mimetype.startsWith("video/")) {
    return sock.sendMessage(adminJid, {
      video: buffer,
      mimetype
    });
  }

  if (mimetype.startsWith("audio/")) {
    return sock.sendMessage(adminJid, {
      audio: buffer,
      mimetype
    });
  }

  return sock.sendMessage(adminJid, {
    document: buffer,
    mimetype,
    fileName: media.fileName || "attachment"
  });
}

export default {
  config: {
    name: "call",
    aliases: ["callad", "called"],
    version: "5.1",
    author: AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: "Contact bot support",
    longDescription: "Send reports to WhatsApp admins and Telegram support",
    category: "support",
    guide: "{p}call <message>"
  },

  onStart: async function ({
    sock,
    message,
    jid,
    senderJid,
    pushName,
    isGroup,
    args,
    reply
  }) {
    if (this.config.author !== AUTHOR) {
      return reply("⛔ Author mismatch. Command disabled.");
    }

    if (
      !TELEGRAM_BOT_TOKEN ||
      TELEGRAM_BOT_TOKEN === "9069783114:AAG8LDchwmlhn6_wXKYmGP-I82tqa0fM4B8"
    ) {
      return reply("❌ এই ফাইলের Telegram Bot Token বসানো হয়নি।");
    }

    const supportJids = getSupportJids();

    if (!supportJids.length) {
      return reply("❌ Owner/Admin-এর JID পাওয়া যায়নি।");
    }

    const media = getMedia(message);

    if (!args.length && !media) {
      return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
📌 𝐂𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐆𝐔𝐈𝐃𝐄:

১. মেসেজ পাঠাতে:
» call আপনার মেসেজ লিখুন।

২. ছবি/ভিডিও পাঠাতে:
» মিডিয়ার ক্যাপশনে call লিখুন।

৩. উত্তর পেতে:
» Admin-এর রিপোর্টে Reply দিন।
» উত্তর মূল চ্যাটে চলে যাবে।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
      );
    }

    const senderName = pushName || senderJid.split("@")[0];
    let groupName = "PRIVATE";

    if (isGroup) {
      try {
        const metadata = await sock.groupMetadata(jid);
        groupName = metadata.subject || "Unknown Group";
      } catch {
        groupName = "Unknown Group";
      }
    }

    const userText = args.join(" ") || "😺🧐🤙";

    const report =
`╭─❖ 📩 𝗡𝗘𝗪 𝗖𝗔𝗟𝗟 ❖─╮
👤 𝗡𝗔𝗠𝗘 › ${senderName}
🆔 𝗨𝗜𝗗 › ${senderJid}
👥 𝗚𝗥𝗢𝗨𝗣 › ${groupName}
╰────────────────╯

💭 𝗠𝗘𝗦𝗦𝗔𝗚𝗘
${userText}

↩️ এই রিপোর্টেএ উত্তর লিখুন`;

    try {
      let buffer = null;

      if (media) {
        buffer = await downloadMediaMessage(
          message,
          "buffer",
          {}
        );
      }

      const adminResults = await Promise.allSettled(
        supportJids.map(async adminJid => {
          const sent = await sock.sendMessage(adminJid, {
            text: report
          });

          const reportMap = readData("callReplies", {});

          reportMap[sent.key.id] = {
            originJid: jid,
            senderJid,
            senderName,
            groupName,
            adminJid,
            createdAt: Date.now()
          };

          await writeData("callReplies", reportMap);

          if (buffer && media) {
            await sendAdminMedia(sock, adminJid, buffer, media);
          }
        })
      );

      if (buffer && media) {
        await sendTelegramMedia(
          buffer,
          media.mimetype || "application/octet-stream",
          report
        );
      } else {
        await sendTelegramText(report);
      }

      const successCount = adminResults.filter(
        result => result.status === "fulfilled"
      ).length;

      return reply(
`✅ | 𝗖𝗔𝗟𝗟 𝗦𝗨𝗖𝗖𝗘𝗦𝗦
💌 WhatsApp Owner/Admin: ${successCount}
📨 Telegram Support Group: Sent
↩️ Admin Reply দিলে উত্তর পাবেন।`
      );

    } catch (err) {
      console.error(
        "[CALL ERROR]",
        err.response?.data || err.message
      );

      return reply(
        "❌ | 𝗦𝗘𝗡𝗗 𝗙𝗔𝗜𝗟𝗘𝗗\n⚠️ Support-এ রিপোর্ট পাঠাতে সমস্যা হয়েছে।"
      );
    }
  },

  onChat: async function ({ sock, message, senderJid, body }) {
    try {
      if (!senderJid || !body || !message) return;

      const supportJids = getSupportJids();

      if (!supportJids.includes(normalizeJid(senderJid))) return;

      const quotedId = getQuotedId(message);
      if (!quotedId) return;

      const reportMap = readData("callReplies", {});
      const report = reportMap[quotedId];

      if (!report) return;

      if (normalizeJid(senderJid) !== normalizeJid(report.adminJid)) {
        return;
      }

      await sock.sendMessage(report.originJid, {
        text:
`╭─❖ 📬 𝗔𝗗𝗠𝗜𝗡 𝗥𝗘𝗣𝗟𝗬 ❖─╮

${body}

╰─ 🤖 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 ─╯`
      });

      delete reportMap[quotedId];
      await writeData("callReplies", reportMap);

      await sock.sendMessage(senderJid, {
        text: "✅"
      });

    } catch (err) {
      console.error("[CALL REPLY ERROR]", err);
    }
  }
};
