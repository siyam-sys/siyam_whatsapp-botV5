
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import { AUTHOR, normalizeNumber } from "../../config.js";

const LOCKED_AUTHOR = AUTHOR;

const commandConfig = {
  name: "wpinfo",
  aliases: ["wp", "ইনফো", "uidinfo"],
  version: "5.0.0",
  author: LOCKED_AUTHOR,
  countDown: 2,
  role: 0,
  shortDescription: "Get WhatsApp user information",
  longDescription: "Fetch available WhatsApp user profile details",
  category: "utility",
  guide: "{pn} [@mention / reply / phone number]"
};

function unwrapMessage(message) {
  let current = message?.message;

  for (let i = 0; i < 5; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.documentWithCaptionMessage?.message;

    if (!next) break;
    current = next;
  }

  return current || {};
}

function getContextInfo(message) {
  const root = unwrapMessage(message);

  return (
    root.extendedTextMessage?.contextInfo ||
    root.imageMessage?.contextInfo ||
    root.videoMessage?.contextInfo ||
    root.documentMessage?.contextInfo ||
    root.audioMessage?.contextInfo ||
    root.stickerMessage?.contextInfo ||
    null
  );
}

function normalizeJid(jid = "") {
  return String(jid)
    .replace(/:\d+(?=@)/, "")
    .trim();
}

async function getUserName(sock, targetJid, senderJid, pushName) {
  try {
    if (
      normalizeJid(targetJid) === normalizeJid(senderJid) &&
      pushName
    ) {
      return pushName;
    }

    const contact =
      sock.contacts?.[targetJid] ||
      sock.store?.contacts?.[targetJid] ||
      {};

    const name =
      contact.verifiedName ||
      contact.notify ||
      contact.name;

    if (name) return name;

    if (typeof sock.getName === "function") {
      const result = await sock.getName(targetJid);
      if (result) return result;
    }
  } catch (error) {
    console.error("[FBINFO NAME]", error.message);
  }

  if (targetJid.endsWith("@s.whatsapp.net")) {
    return targetJid.split("@")[0];
  }

  return "WhatsApp User";
}

export default {
  config: commandConfig,

  onStart: async function ({
    sock,
    message,
    jid,
    senderJid,
    pushName,
    args = [],
    reply
  }) {
    // 🔒 AUTHOR SECURITY LOCK
    if (commandConfig.author !== LOCKED_AUTHOR) {
      return reply(
        "⛔ This file is locked!\nAuthor change detected."
      );
    }

    try {
      const contextInfo = getContextInfo(message);
      const mentions = contextInfo?.mentionedJid || [];

      let targetJid = "";

      // 1. Replied user
      if (contextInfo?.quotedMessage) {
        targetJid =
          contextInfo.participant ||
          contextInfo.participantAlt ||
          (!jid.endsWith("@g.us") ? jid : "");

      // 2. Mentioned user
      } else if (mentions.length > 0) {
        targetJid = mentions[0];

      // 3. Phone number or WhatsApp JID
      } else if (args[0]) {
        const input = String(args[0]).trim();

        if (input.includes("@")) {
          targetJid = input;
        } else {
          const number = normalizeNumber(input);

          if (!number || number.length < 7) {
            return reply("❌ সঠিক WhatsApp নম্বর দাও।");
          }

          targetJid = `${number}@s.whatsapp.net`;
        }

      // 4. Own information
      } else {
        targetJid = senderJid;
      }

      targetJid = normalizeJid(targetJid);

      if (!targetJid) {
        return reply(
          "❌ ইউজার শনাক্ত করা যায়নি!\n\nকাউকে Mention করো, তার মেসেজে Reply দাও অথবা WhatsApp নম্বর লিখো।"
        );
      }

      // Get user name
      const name = await getUserName(
        sock,
        targetJid,
        senderJid,
        pushName
      );

      const isLid = targetJid.endsWith("@lid");

      let phoneNumber = targetJid.endsWith("@s.whatsapp.net")
        ? targetJid.split("@")[0]
        : "";

      // Check WhatsApp account
      let accountStatus = "তথ্য পাওয়া যায়নি";

      if (
        phoneNumber &&
        typeof sock.onWhatsApp === "function"
      ) {
        try {
          const result = await sock.onWhatsApp(phoneNumber);

          if (Array.isArray(result) && result.length > 0) {
            accountStatus = result[0].exists
              ? "সক্রিয় WhatsApp অ্যাকাউন্ট"
              : "WhatsApp অ্যাকাউন্ট পাওয়া যায়নি";

            if (result[0].jid) {
              targetJid = normalizeJid(result[0].jid);
              phoneNumber = targetJid.split("@")[0];
            }
          }
        } catch (error) {
          console.error("[FBINFO ACCOUNT]", error.message);
        }
      }

      const displayNumber = phoneNumber || "Private / Hidden";

      const username = "WhatsApp-এ প্রকাশিত নয়";
      const gender = "Private / Hidden";
      const isFriend = "WhatsApp API থেকে জানা যায় না";
      const birthday = "WhatsApp API থেকে জানা যায় না";

      const profileUrl = phoneNumber
        ? `https://wa.me/${phoneNumber}`
        : "প্রকাশিত নয়";

      const userId = isLid
        ? "Private WhatsApp ID"
        : targetJid;

      return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
👤 𝐔𝐒𝐄𝐑 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐈𝐍𝐅𝐎

» 📛 𝐍𝐚𝐦𝐞 : ${name}
» 🆔 𝐔𝐈𝐃 : ${userId}
» 📱 𝐍𝐮𝐦𝐛𝐞𝐫 : ${displayNumber}
» 🏷️ 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 : ${username}
» 👤 𝐆𝐞𝐧𝐝𝐞𝐫 : ${gender}
» 🤝 𝐅𝐫𝐢𝐞𝐧𝐝 : ${isFriend}
» 🎂 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 : ${birthday}
» 📡 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 : ${accountStatus}
» 🔗 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 : ${profileUrl}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
      );

    } catch (err) {
      console.error("[FBINFO ERROR]", err);

      return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑!
» ⚠️ WhatsApp থেকে ইউজার
» 🤔 ইনফরমেশন লোড করা যায়নি।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗉𝗛𝗨𝗌𝗔𝗍 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
      );
    }
  }
};
