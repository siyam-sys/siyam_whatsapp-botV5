const axios = require("axios");

const MIDDLEWARE_URL = "https://xrahat-dev-undress.vercel.app/undress";
const AUTHOR_LOCK = "🔰𝐗ʀᴀʜᴀᴛ-ᴅᴇᴠ🔰";

module.exports = {
  config: {
    name: "re",
    version: "1.0",
    role: 2,
    author: AUTHOR_LOCK,
    shortDescription: "AI image edit",
    longDescription: "Reply to an image with the command to edit it using AI",
    category: "AI",
    guide: "re"
  },

  execute: async function ({ sock, message, jid, reply }) {
    let waitMsg;

    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imageMessage =
        quoted?.imageMessage ||
        message.message?.imageMessage;

      if (!imageMessage) {
        return reply("❌ একটি ছবিতে Reply দিয়ে re কমান্ড ব্যবহার করুন।");
      }

      if (!MIDDLEWARE_URL) {
        return reply("⚠️ API URL এখনো সেট করা হয়নি।");
      }

      const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
      const stream = await downloadContentFromMessage(imageMessage, "image");
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const imageBuffer = Buffer.concat(chunks);
      const imageUrl = `data:${imageMessage.mimetype || "image/jpeg"};base64,${imageBuffer.toString("base64")}`;

      waitMsg = await sock.sendMessage(jid, {
        text: "⏳ অনুগ্রহ করে অপেক্ষা করুন..."
      }, { quoted: message });

      const response = await axios.post(
        MIDDLEWARE_URL,
        {
          imageUrl,
          credit: AUTHOR_LOCK,
          task: "safe_image_edit"
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 90000
        }
      );

      const data = response.data;

      if (!data.success || !data.resultUrl) {
        throw new Error(data.error || "API Error");
      }

      if (waitMsg?.key) {
        await sock.sendMessage(jid, {
          delete: waitMsg.key
        });
      }

      await sock.sendMessage(
        jid,
        {
          image: { url: data.resultUrl },
          caption: data.captionTemplate || "✅ ছবি সম্পাদনা সফল হয়েছে!"
        },
        { quoted: message }
      );

    } catch (error) {
      if (waitMsg?.key) {
        try {
          await sock.sendMessage(jid, {
            delete: waitMsg.key
          });
        } catch {}
      }

      console.error("RE command error:", error);
      return reply(`⚠️ ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  }
};
