
import { AUTHOR } from "../../config.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  config: {
    name: "clear",
    aliases: ["sall", "unsendall"],
    version: "3.6",
    author: AUTHOR,
    role: 2,
    description: "Safely unsends recent bot messages in batches",
    category: "owner",
    guide: "clear",
    coolDown: 5
  },

  onStart: async function ({ sock, jid, reply }) {
    try {
      const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
      const history = await sock.fetchMessageHistory?.(50, jid);

      if (!Array.isArray(history)) {
        return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐡𝐢𝐬𝐭𝐨𝐫𝐲 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
        );
      }

      const botMessages = history.filter((message) => {
        const key = message.key || {};
        const remoteJid = key.remoteJid || message.remoteJid;
        const fromMe = key.fromMe === true;
        const participant = key.participant || message.participant || "";
        const sender = message.senderJid || message.sender || participant;

        return (
          remoteJid === jid &&
          (fromMe || sender.split("@")[0] === botJid.split("@")[0])
        );
      });

      if (botMessages.length === 0) {
        return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ℹ️ ডিলিট করার মতো
» 🤯 কোনো মেসেজ নেই!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗔𝗠 𝗖𝗛𝗔𝗧𝗁𝗢𝗧`
        );
      }

      const waitMsg = await sock.sendMessage(jid, {
        text:
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭
» 👏 𝐦𝐞𝐬𝐬𝐚𝐠𝐞𝐬 𝐚𝐫𝐞 𝐝𝐞𝐥𝐞𝐭𝐢𝐧𝐠...
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗔𝗠 𝗖𝗛𝗔𝗓𝗕𝗢𝗧`
      });

      const targetMessages = botMessages.slice(0, 20);
      let successCount = 0;

      for (const message of targetMessages) {
        const key = message.key;

        if (!key?.id || !key?.remoteJid) continue;

        try {
          await sock.sendMessage(key.remoteJid, {
            delete: key
          });
          successCount++;
          await delay(800);
        } catch (error) {
        }
      }

      if (waitMsg?.key?.id) {
        try {
          await sock.sendMessage(jid, {
            delete: waitMsg.key
          });
        } catch (error) {
        }
      }

      if (successCount > 0) {
        return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ✅ সফলভাবে মেসেজ
» 😘 ডিলিট করা হয়েছে!
» 💡 আরও মেসেজ ডিলিট
» 😉 করতে চাইলে
» 🤪 আবার কমান্ড দিন।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗔𝗠 𝗖𝗛𝗔𝗓𝗕𝗢𝗧`
        );
      }

      return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ⚠️ কোনো মেসেজ
» 🥲 ডিলিট করা সম্ভব হয়নি!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗔𝗠 𝗖𝗛𝗔𝗓𝗕𝗢𝗧`
      );
    } catch (error) {
      console.error("Clear command error:", error);
      return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ কমান্ডটি রান করতে
» 😀 সমস্যা হয়েছে!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗔𝗠 𝗖𝗛𝗔𝗓𝗕𝗢𝗧`
      );
    }
  }
};
