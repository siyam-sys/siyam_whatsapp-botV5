
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import { AUTHOR } from "../../config.js";

export default {
  config: {
    name: "pp",
    aliases: ["profile", "avatar"],
    version: "1.0.1",
    author: AUTHOR,
    role: 0,
    category: "utility",
    shortDescription: "Shows profile picture",
    longDescription: "Shows user profile picture with custom design",
    guide: "{pn}"
  },

  onStart: async function ({
    sock,
    message,
    jid,
    senderJid,
    pushName,
    reply
  }) {
    try {
      const contextInfo =
        message.message?.extendedTextMessage?.contextInfo ||
        message.message?.imageMessage?.contextInfo ||
        message.message?.videoMessage?.contextInfo ||
        message.message?.documentMessage?.contextInfo;

      const targetJid =
        contextInfo?.participant || senderJid;

      const userId = targetJid
        .split("@")[0]
        .split(":")[0];

      const firstName = contextInfo?.participant
        ? "User"
        : (pushName || "User");

      let profileUrl;

      try {
        profileUrl = await sock.profilePictureUrl(
          targetJid,
          "image"
        );
      } catch {
        return reply(
          `👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
📸 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗣𝗜𝗖𝗧𝗨𝗥𝗘
👤 𝐍𝐚𝐦𝐞: ${firstName}
🆔 𝐔𝐈𝐃: ${userId}

⚠️ ইউজার কোনো প্রোফাইল পিকচার সেট করেনি!
───────────────
🧚‍♀️ 𝐍𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
        );
      }

      const captionText =
`👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
📸 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗣𝗜𝗖𝗧𝗨𝗥𝗘
👤 𝐍𝐚𝐦𝐞: ${firstName}
🆔 𝐔𝐈𝐃: ${userId}
🌸 আপনার পিকচার!
───────────────
🧚‍♀️ 𝐍𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      return await sock.sendMessage(
        jid,
        {
          image: { url: profileUrl },
          caption: captionText
        },
        { quoted: message }
      );

    } catch (error) {
      console.error("PP Command Error:", error);
      return reply(
        "❌ প্রোফাইল পিকচার আনতে কোনো সমস্যা হয়েছে!"
      );
    }
  }
};
