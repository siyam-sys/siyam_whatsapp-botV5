// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
import { AUTHOR } from "../../config.js";

const API = "https://noobs-api.top/dipto/baby";
const replies = [
  "𝗵𝗲 𝗯𝗼𝘁 𝗯𝗼𝘁 𝗰𝗵𝗶𝗹𝗹 𝗯𝗿𝗼!",
  "আমি 𓆩সিয়াম𓆪 বস এর সাথে বিজি আছি-😕😏",
  "আমার বস 𓆩সিয়াম𓆪 কে একটা জি GF দাও-😽🫶",
  "জান তোমার নানি রে আমার হাতে তুলে দিবা-🙊🙆‍♂",
  "𓆩সিয়াম𓆪 বস'এর হবু বউ রে কেও দেকছো?😪",
  "ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤",
  "বেশি Bot Bot করলে leave নিবো কিন্তু😒",
  "তোর বাড়ি কি কিশোরগঞ্জ, পোড়াবাড়িয়া গ্রাম😵‍💫",
  "আরে আমি মজা করার mood এ নাই😒",
  "বস 𓆩সিয়াম𓆪 এর সাথে কথা বলবো এখন , ডিস্টার্ব করিস না 😒",
  "বেশি বেশি বকবক করলে তোকে ব্লক মেরে দেবো কিন্তু-🐸",
  "ওই যে দেখো 𓆩সিয়াম𓆪 বস যাচ্ছে , এক বালতি প্রেম দিয়ে দাও 🤭"
];

export default {
  config: {
    name: "botAutoReply",
    event: "messages.upsert",
    version: "1.0.0",
    author: AUTHOR,
    description: "Auto reply when a message starts with bot or বট"
  },

  onStart: async ({ sock, data }) => {
    if (data?.type !== "notify") return;
    for (const msg of data.messages || []) {
      if (!msg?.message || msg.key?.fromMe) continue;
      const jid = msg.key?.remoteJid;
      if (!jid || jid === "status@broadcast") continue;

      const m = msg.message;
      const body = (m.conversation || m.extendedTextMessage?.text ||
        m.imageMessage?.caption || m.videoMessage?.caption || "").trim();
      if (!body || !/^(bot|বট)(\s|$)/i.test(body)) continue;

      const text = body.replace(/^(bot|বট)\s*/i, "").trim();
      try {
        if (!text) {
          const answer = replies[Math.floor(Math.random() * replies.length)];
          await sock.sendMessage(jid, { text: `「 ${msg.pushName || "User"} 」\n\n${answer}` }, { quoted: msg });
        } else {
          const sender = msg.key.participant || jid;
          const url = `${API}?text=${encodeURIComponent(text)}&senderID=${encodeURIComponent(sender)}&font=1`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`API ${res.status}`);
          const data = await res.json();
          if (data.reply) await sock.sendMessage(jid, { text: String(data.reply) }, { quoted: msg });
        }
      } catch (error) {
        console.error("[BOT AUTO REPLY]", error.message);
      }
    }
  }
};
