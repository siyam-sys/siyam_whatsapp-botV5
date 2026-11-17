// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
import { AUTHOR } from "../../config.js";

const API = "https://noobs-api.top/dipto/baby";

export default {
  config: {
    name: "bot",
    aliases: ["mbot", "milonbot"],
    version: "10.0.0-wa",
    author: AUTHOR,
    role: "USER",
    description: "Bangla conversational bot",
    category: "fun",
    guide: "{pn} [text] | {pn} teach প্রশ্ন - উত্তর"
  },

  onStart: async ({ sock, jid, senderJid, args, reply, message }) => {
    try {
      if (!args.length) {
        return reply(`「 ${message.pushName || "User"} 」\nবলুন আমি "বট" আপনাকে কিভাবে সাহায্য করতে পারি?`);
      }

      if (args[0].toLowerCase() === "teach") {
        const [q, a] = args.slice(1).join(" ").split(/\s*-\s*/);
        if (!q || !a) return reply("⚠️ Format: /bot teach প্রশ্ন - উত্তর");
        const url = `${API}?teach=${encodeURIComponent(q)}&reply=${encodeURIComponent(a)}&senderID=${encodeURIComponent(senderJid)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        return reply(`✅ Added: ${data.message || "শেখানো সম্পন্ন হয়েছে"}`);
      }

      const url = `${API}?text=${encodeURIComponent(args.join(" "))}&senderID=${encodeURIComponent(senderJid)}&font=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      return reply(data.reply || "দুঃখিত, এখন উত্তর দিতে পারছি না।");
    } catch (error) {
      console.error("[BOT COMMAND]", error);
      return reply("API Busy! পরে আবার চেষ্টা করো।");
    }
  }
};
