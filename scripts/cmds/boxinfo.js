
import { AUTHOR } from "../../config.js";

const LOCKED_AUTHOR = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

function getBangladeshDateTime() {
  const now = new Date();

  const timeStr = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const dateStr = now.toLocaleDateString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return { timeStr, dateStr };
}

export default {
  config: {
    name: "boxinfo",
    aliases: ["🎁", "বক্সইনফো", "gc2"],
    version: "6.0.0",
    author: AUTHOR,
    countDown: 2,
    role: 0,
    shortDescription: "Get official text-only group info with real date & time",
    longDescription: "Fetch group details including member count, admin count, real date & time in fast text format without images",
    category: "utility",
    guide: "{p}boxinfo"
  },

  onStart: async function ({ sock, jid, isGroup, reply }) {
    try {
      if (!isGroup) {
        return reply("» ❌ এই কমান্ডটি শুধু WhatsApp গ্রুপে ব্যবহার করা যাবে।");
      }

      // Author Security Lock
      if (this.config.author !== LOCKED_AUTHOR && AUTHOR !== LOCKED_AUTHOR) {
        console.warn("Boxinfo author lock mismatch.");
      }

      const metadata = await sock.groupMetadata(jid);

      const groupName = metadata.subject || "নাম নাই ☹️";
      const groupID = metadata.id || jid;

      const participants = metadata.participants || [];
      const memberCount = participants.length;

      const adminCount = participants.filter(
        participant =>
          participant.admin === "admin" ||
          participant.admin === "superadmin"
      ).length;

      const { timeStr, dateStr } = getBangladeshDateTime();

      const text =
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
📊 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
» 🏷️ 𝐆𝐫𝐨𝐮𝐩 𝐍𝐚𝐦𝐞 : ${groupName}
» 🆔 𝐆𝐫𝐨𝐮𝐩 𝐈𝐃 :
» 🆔 ${groupID}
» 👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 : ${memberCount} জন
» 👑 𝐀𝐝𝐦𝐢𝐧𝐬 : ${adminCount} জন
» 💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬 : N/A
» 🎨 𝐆𝐜 𝐄𝐦𝐨𝐣𝐢 : 👍 ডিফল্ট
» 🔒 𝐀𝐩𝐩𝐫𝐨𝐯𝐚𝐥 𝐌𝐨𝐝𝐞 : N/A
» ⏰ 𝐓𝐢𝐦𝐞 : ${timeStr}
» 📅 𝐃𝐚𝐭𝐞 : ${dateStr}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      return reply(text);

    } catch (err) {
      console.error("[BOXINFO ERROR]", err);

      return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑!
» ⚠️ গ্রুপ ইনফরমেশন
» 🫢 লোড করতে ব্যর্থ হয়েছে।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
      );
    }
  }
};
