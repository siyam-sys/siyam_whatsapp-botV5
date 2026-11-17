
import { AUTHOR } from "../../config.js";
import { getGroup, updateGroup } from "../../database/groups.js";

export default {
  config: {
    name: "cnprefix",
    aliases: ["cn", "setprefix"],
    version: "3.0",
    author: AUTHOR,
    role: 2,
    category: "SYSTEM",
    shortDescription: "Change prefix for current group",
    longDescription: "Change the prefix for the current WhatsApp group.",
    usage: "{pn} <new_prefix>"
  },

  onStart: async ({ jid, isGroup, args = [], reply, permission }) => {
    if ((permission?.roleLevel ?? 0) < 2) {
      return reply("⛔ শুধু Bot Admin অথবা Bot Owner ব্যবহার করতে পারবেন।");
    }

    if (!isGroup) {
      return reply("❌ এই কমান্ডটি শুধু গ্রুপে ব্যবহার করা যাবে।");
    }

    const newPrefix = String(args[0] || "");

    if (!newPrefix) {
      const group = await getGroup(jid);

      return reply(
        `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ নতুন Prefix দিন।
» 💡 উদাহরণ: /cnprefix !
» 📌 বর্তমান: ${group.prefix || "Global Prefix"}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
      );
    }

    if (newPrefix.length > 5 || /\s/.test(newPrefix)) {
      return reply("❌ Prefix ১-৫ অক্ষরের হতে হবে এবং Space থাকা যাবে না।");
    }

    try {
      await updateGroup(jid, { prefix: newPrefix });

      return reply(
        `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ✅ Prefix পরিবর্তন হয়েছে।
» 📌 নতুন Prefix: [ ${newPrefix} ]
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗀𝗔𝗧𝗁𝗢𝗧`
      );
    } catch (error) {
      console.error("[CNPREFIX]", error);
      return reply("❌ Prefix আপডেট করতে সমস্যা হয়েছে।");
    }
  }
};
