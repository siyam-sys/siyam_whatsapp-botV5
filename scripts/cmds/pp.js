const config = require("../config");

module.exports = {
  name: "pp",
  aliases: ["profile", "avatar"],
  version: "1.0.1",
  author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
  role: 0,
  category: "utility",
  shortDescription: "Shows profile picture",
  longDescription: "Shows user profile picture with custom design",
  guide: "{pn}",

  execute: async (bot, msg, args) => {
    const chatId = msg.key.remoteJid;

    const BOT_USERNAME = config.botUsername || "SiyamSM_2026Bot";
    const OWNER_USERNAME = config.ownerUsername || "ri_siyam";

    try {
      let targetJid = chatId;

      const contextInfo =
        msg.message?.extendedTextMessage?.contextInfo ||
        msg.message?.imageMessage?.contextInfo ||
        msg.message?.videoMessage?.contextInfo;

      if (contextInfo?.participant) {
        targetJid = contextInfo.participant;
      }

      const userId = targetJid.split("@")[0];

      let firstName = "User";

      try {
        const contact = await bot.onWhatsApp(targetJid);
        if (contact?.[0]?.exists) {
          firstName = contact[0].notify || firstName;
        }
      } catch {}

      const profilePictureUrl = await bot.profilePictureUrl(
        targetJid,
        "image"
      ).catch(() => null);

      const captionText =
`👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
📸 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗣𝗜𝗖𝗧𝗨𝗥𝗘
👤 𝐍𝐚𝐦𝐞: ${firstName}
🆔 𝐔𝐈𝐃: ${userId}
🌸 আপনার পিকচার!
───────────────
🧚‍♀️ 𝐍𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      const buttons = [
        {
          buttonId: "cmd_list",
          buttonText: { displayText: "📜 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓" },
          type: 1
        },
        {
          buttonId: "owner_contact",
          buttonText: { displayText: "𝐎𝐖𝐍𝐄𝐑" },
          type: 1
        },
        {
          buttonId: "add_group",
          buttonText: { displayText: "𝐀𝐃𝐃 𝐆𝐑𝐎𝐔𝐏" },
          type: 1
        }
      ];

      if (profilePictureUrl) {
        return await bot.sendMessage(
          chatId,
          {
            image: { url: profilePictureUrl },
            caption: captionText,
            footer: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
            buttons,
            headerType: 4
          },
          { quoted: msg }
        );
      } else {
        return await bot.sendMessage(
          chatId,
          {
            text:
              captionText +
              "\n\n⚠️ ইউজার কোনো প্রোফাইল পিকচার সেট করেনি!"
          },
          { quoted: msg }
        );
      }

    } catch (error) {
      console.error("PP Command Error:", error);

      return bot.sendMessage(
        chatId,
        {
          text: "❌ প্রোফাইল পিকচার আনতে কোনো সমস্যা হয়েছে!"
        },
        { quoted: msg }
      );
    }
  }
};
