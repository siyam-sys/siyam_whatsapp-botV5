
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import { AUTHOR } from "../../config.js";

const API = "https://noobs-api.top/dipto/baby";

async function askBot({ text, senderJid, reply }) {
  const question = String(text || "").trim();

  if (!question) {
    return reply("কিছু লিখে পাঠাও, আমি উত্তর দেওয়ার চেষ্টা করব।");
  }

  const url =
    `${API}?text=${encodeURIComponent(question)}` +
    `&senderID=${encodeURIComponent(senderJid || "")}&font=1`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000)
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  const data = await res.json();

  return reply(
    data.reply || "দুঃখিত, এখন উত্তর দিতে পারছি না।"
  );
}

export default {
  config: {
    name: "bot",
    aliases: ["mbot", "milonbot"],
    version: "11.0.0-wa",
    author: AUTHOR,
    role: "USER",
    description: "Bangla conversational bot",
    category: "fun",
    guide: "{pn} [text] | {pn} teach প্রশ্ন - উত্তর"
  },

  onStart: async ({ args, reply, message, senderJid }) => {
    try {
      if (!args.length) {
        return reply(
          `「 ${message.pushName || "User"} 」\n` +
          `বলুন আমি "বট" আপনাকে কিভাবে সাহায্য করতে পারি?\n\n` +
          `আমার মেসেজে Reply করেও কথা বলতে পারবেন।`
        );
      }

      if (args[0].toLowerCase() === "teach") {
        const teachingText = args.slice(1).join(" ");
        const separator = teachingText.indexOf("-");

        if (separator === -1) {
          return reply("⚠️ Format: /bot teach প্রশ্ন - উত্তর");
        }

        const q = teachingText.slice(0, separator).trim();
        const a = teachingText.slice(separator + 1).trim();

        if (!q || !a) {
          return reply("⚠️ প্রশ্ন এবং উত্তর দুটোই লিখতে হবে।");
        }

        const url =
          `${API}?teach=${encodeURIComponent(q)}` +
          `&reply=${encodeURIComponent(a)}` +
          `&senderID=${encodeURIComponent(senderJid || "")}`;

        const res = await fetch(url, {
          signal: AbortSignal.timeout(20000)
        });

        if (!res.ok) {
          throw new Error(`Teach API Error: ${res.status}`);
        }

        const data = await res.json();

        return reply(
          `✅ Added: ${data.message || "শেখানো সম্পন্ন হয়েছে"}`
        );
      }

      return await askBot({
        text: args.join(" "),
        senderJid,
        reply
      });

    } catch (error) {
      console.error("[BOT COMMAND]", error);
      return reply("API Busy! পরে আবার চেষ্টা করো।");
    }
  },

  onReply: async ({ body, senderJid, reply }) => {
    try {
      if (!body || !body.trim()) return;

      return await askBot({
        text: body,
        senderJid,
        reply
      });

    } catch (error) {
      console.error("[BOT REPLY]", error);
      return reply("API Busy! একটু পরে আবার চেষ্টা করো।");
    }
  }
};
