
import axios from "axios";
import fs from "fs-extra";
import FormData from "form-data";
import os from "os";
import path from "path";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { AUTHOR } from "../../config.js";

const LOCKED_AUTHOR = AUTHOR;

function getQuotedMessage(message) {
  const context =
    message?.message?.extendedTextMessage?.contextInfo ||
    message?.message?.imageMessage?.contextInfo ||
    message?.message?.videoMessage?.contextInfo ||
    message?.message?.documentMessage?.contextInfo ||
    message?.message?.audioMessage?.contextInfo;

  if (!context?.quotedMessage || !context?.stanzaId) return null;

  return {
    key: {
      remoteJid: message.key.remoteJid,
      id: context.stanzaId,
      participant: context.participant
    },
    message: context.quotedMessage
  };
}

function getMediaMessageType(message) {
  const content = message?.message || {};

  if (content.imageMessage) return "image";
  if (content.videoMessage) return "video";
  if (content.audioMessage) return "audio";
  if (content.documentMessage) return "document";
  if (content.stickerMessage) return "sticker";

  return null;
}

function getExtension(media, type) {
  const mimetype = media?.mimetype || "";

  if (mimetype.includes("gif")) return ".gif";
  if (mimetype.startsWith("image/")) return ".jpg";
  if (mimetype.startsWith("video/")) return ".mp4";
  if (mimetype.startsWith("audio/")) return ".mp3";

  if (type === "sticker") return ".webp";

  return path.extname(media?.fileName || "") || ".bin";
}

async function uploadCatbox(filePath) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", fs.createReadStream(filePath));

  const response = await axios.post(
    "https://catbox.moe/user/api.php",
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000
    }
  );

  const link = response.data?.toString().trim();

  if (link?.startsWith("https://")) return link;

  throw new Error("Catbox upload failed");
}

async function uploadTmpFiles(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const response = await axios.post(
    "https://tmpfiles.org/api/v1/upload",
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000
    }
  );

  const raw = response.data?.data?.url;

  if (raw) {
    return raw.replace(
      "https://tmpfiles.org/",
      "https://tmpfiles.org/dl/"
    );
  }

  throw new Error("TmpFiles upload failed");
}

async function uploadZeroX(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const response = await axios.post(
    "https://0x0.st",
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000
    }
  );

  const link = response.data?.toString().trim();

  if (link?.startsWith("https://")) return link;

  throw new Error("0x0.st upload failed");
}

export default {
  config: {
    name: "catbox",
    aliases: ["up", "upload"],
    version: "1.0.0",
    author: AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: "Upload media",
    longDescription: "Upload image, video, audio and get direct link",
    category: "tools",
    guide: "Reply to an image/video/audio and use catbox"
  },

  onStart: async function ({ sock, message, jid, reply }) {
    let tempPath = null;
    let loadingMessage = null;

    try {
      if (this.config.author !== LOCKED_AUTHOR) {
        return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ⛔ 𝗙𝗜𝗟𝗘 𝗟𝗢𝗖𝗞𝗘𝗗
» ❌ সিয়াম ভাই এর নাম
» 🤦 পরিবর্তন করা হয়েছে!
» ⚠️ এই কমান্ডটি নষ্ট করা হলো।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
        );
      }

      const quotedMessage = getQuotedMessage(message);

      if (!quotedMessage) {
        return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 📌 যেকোনো ছবি, ভিডিও,
» 🎙️ অডিও বা GiF রিপ্লাই দিন!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
        );
      }

      const mediaType = getMediaMessageType(quotedMessage);

      if (!mediaType) {
        return reply(
          "❌ রিপ্লাই করা মেসেজে কোনো সাপোর্টেড মিডিয়া পাওয়া যায়নি।"
        );
      }

      try {
        await sock.sendMessage(jid, {
          react: {
            text: "📤",
            key: message.key
          }
        });
      } catch {}

      loadingMessage = await sock.sendMessage(
        jid,
        {
          text:
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ☁️ ফাইল আপলোড করা হচ্ছে...
» ⏳ অনুগ্রহ করে অপেক্ষা করুন!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
        },
        { quoted: message }
      );

      const media =
        quotedMessage.message.imageMessage ||
        quotedMessage.message.videoMessage ||
        quotedMessage.message.audioMessage ||
        quotedMessage.message.documentMessage ||
        quotedMessage.message.stickerMessage;

      const buffer = await downloadMediaMessage(
        quotedMessage,
        "buffer",
        {}
      );

      if (!buffer?.length) {
        throw new Error("মিডিয়া ডাউনলোড করা যায়নি।");
      }

      const ext = getExtension(media, mediaType);

      tempPath = path.join(
        os.tmpdir(),
        `catbox_${Date.now()}${ext}`
      );

      await fs.writeFile(tempPath, buffer);

      let finalLink = null;

      try {
        finalLink = await uploadCatbox(tempPath);
      } catch (error) {
        console.error("[CATBOX ERROR]", error.message);
      }

      if (!finalLink) {
        try {
          finalLink = await uploadTmpFiles(tempPath);
        } catch (error) {
          console.error("[TMPFILES ERROR]", error.message);
        }
      }

      if (!finalLink) {
        try {
          finalLink = await uploadZeroX(tempPath);
        } catch (error) {
          console.error("[0X0 ERROR]", error.message);
        }
      }

      if (!finalLink) {
        throw new Error("সবগুলো সার্ভারে আপলোড ব্যর্থ হয়েছে।");
      }

      if (loadingMessage?.key) {
        try {
          await sock.sendMessage(jid, {
            delete: loadingMessage.key
          });
        } catch {}
      }

      try {
        await sock.sendMessage(jid, {
          react: {
            text: "✅",
            key: message.key
          }
        });
      } catch {}

      return sock.sendMessage(
        jid,
        {
          text:
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🎉 ফাইল আপলোড সফল হয়েছে!
» 🌐 লিঙ্ক: ${finalLink}`
        },
        { quoted: message }
      );

    } catch (error) {
      console.error("[CATBOX ERROR]", error);

      try {
        await sock.sendMessage(jid, {
          react: {
            text: "❌",
            key: message.key
          }
        });
      } catch {}

      return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 💥 ফাইল আপলোড ব্যর্থ হয়েছে!
» ❌ কারণ: ${error.message}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
      );

    } finally {
      if (tempPath) {
        try {
          await fs.remove(tempPath);
        } catch {}
      }
    }
  }
};
