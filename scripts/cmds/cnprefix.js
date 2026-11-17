// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// Original cnprefix layout retained; uses WhatsApp group database.

import { AUTHOR, isBotAdmin } from "../../config.js";
import { getGroup, updateGroup } from "../../database/groups.js";

export default {
  config: {
    name: "cnprefix",
    aliases: ["cn", "setprefix"],
    version: "2.6.0",
    author: AUTHOR,
    role: "BOT_ADMIN",
    category: "SYSTEM",
    shortDescription: "Change prefix for current group",
    longDescription: "Allows bot admins to change the prefix specifically for the current WhatsApp group.",
    usage: "{pn} <new_prefix>"
  },

  onStart: async ({ jid, isGroup, senderJid, args = [], reply }) => {
    if (!isGroup) return reply("❌ এই কমান্ডটি শুধু গ্রুপে ব্যবহার করা যাবে।");

    if (!isBotAdmin(senderJid)) {
      return reply(`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 😏 আগে লেবেলে আয়
» 👑 শুধুমাত্র বট এডমিন
» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
» ✅ ব্যবহার করতে পারবেন।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`);
    }

    const newPrefix = String(args[0] || "");
    if (!newPrefix) {
      const group = await getGroup(jid);
      return reply(`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ অনুগ্রহ করে নতুন
» 🤒 প্রিফিক্সটি দিন!
» 💡 উদাহরণ: /cnprefix !
» 📌 বর্তমান: ${group.prefix || "Global Prefix"}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗉𝗛𝗔𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`);
    }

    if (newPrefix.length > 5 || /\s/.test(newPrefix)) {
      return reply("❌ Prefix ১-৫ অক্ষরের হতে হবে এবং Space থাকা যাবে না।");
    }

    try {
      await updateGroup(jid, { prefix: newPrefix });
      return reply(`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ✅ এই গ্রুপের প্রিফিক্স
» 🎀 পরিবর্তন করা হয়েছে!
» 📌 𝗡𝗲𝘄 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${newPrefix} ]
» 👥 এখন থেকে সবাই [ ${newPrefix} ]
» ☠️ দিয়ে কমান্ড ব্যবহার করতে পারবেন।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`);
    } catch (error) {
      console.error("[CNPREFIX]", error);
      return reply("» ❌ প্রিফিক্স আপডেট করতে সমস্যা হয়েছে!");
    }
  }
};
