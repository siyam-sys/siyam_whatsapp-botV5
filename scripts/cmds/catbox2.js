
import axios from "axios";
import fs from "fs-extra";
import FormData from "form-data";
import os from "os";
import path from "path";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { AUTHOR } from "../../config.js";

const LOCKED_AUTHOR = AUTHOR;

async function getUploadApiUrl() {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/Ayan-alt-deep/xyc/main/baseApiurl.json",
      { timeout: 15000 }
    );

    return res.data?.catbox || "https://catbox.moe/user/api.php";
  } catch {
    return "https://catbox.moe/user/api.php";
  }
}

function getQuotedMessage(message) {
  const context =
    message?.message?.extendedTextMessage?.contextInfo ||
    message?.message?.imageMessage?.contextInfo ||
    message?.message?.videoMessage?.contextInfo ||
    message?.message?.documentMessage?.contextInfo;

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

function getMedia(quoted) {
  const content = quoted?.message || {};

  return (
    content.imageMessage ||
    content.videoMessage ||
    content.documentMessage ||
    null
  );
}

function getExtension(media) {
  if (media?.mimetype?.startsWith("image/")) {
    return media.mimetype.includes("png") ? ".png" : ".jpg";
  }

  if (media?.mimetype?.startsWith("video/")) {
    return ".mp4";
  }

  return path.extname(media?.fileName || "") || ".bin";
}

export default {
  config: {
    name: "catbox2",
    aliases: ["ct2"],
    version: "1.3",
    author: AUTHOR,
    countDown: 5,
    role: 2,
    shortDescription: "Upload media to catbox.moe",
    longDescription: "Upload replied image or video to catbox.moe and get link",
    category: "tools",
    guide: "Reply to an image/video and use catbox3"
  },

  onStart: async function ({ sock, message, jid, reply }) {
    let filePath = null;
    let loading = null;

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

      const quoted = getQuotedMessage(message);
      const media = getMedia(quoted);

      if (!quoted || !media) {
        return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 📁 যেকোনো ছবি অথবা
» 🎬 ভিডিওতে রিপ্লাই দিন!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
        );
      }

      if (
        !media.mimetype?.startsWith("image/") &&
        !media.mimetype?.startsWith("video/")
      ) {
        return reply("❌ শুধু ছবি অথবা ভিডিও আপলোড করা যাবে।");
      }

      try {
        await sock.sendMessage(jid, {
          react: {
            text: "🕛",
            key: message.key
          }
        });
      } catch {}

      loading = await sock.sendMessage(
        jid,
        {
          text:
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🚀 ফাইল ক্যাটবক্সে পাঠানোর কাজ
» 🌌 দ্রুত গতিতে চলছে...
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
        },
        { quoted: message }
      );

      const buffer = await downloadMediaMessage(
        quoted,
        "buffer",
        {}
      );

      if (!buffer?.length) {
        throw new Error("মিডিয়া ডাউনলোড করা যায়নি।");
      }

      filePath = path.join(
        os.tmpdir(),
        `catbox3_${Date.now()}${getExtension(media)}`
      );

      await fs.writeFile(filePath, buffer);

      const uploadApiUrl = await getUploadApiUrl();
      const form = new FormData();

      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(filePath));

      const upload = await axios.post(uploadApiUrl, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000
      });

      const finalLink = upload.data?.toString().trim();

      if (!finalLink || !finalLink.startsWith("https://")) {
        throw new Error("সার্ভার থেকে সঠিক লিংক পাওয়া যায়নি।");
      }

      if (loading?.key) {
        try {
          await sock.sendMessage(jid, {
            delete: loading.key
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
» 💎 মিডিয়া আপলোড সম্পন্ন!
» ✨ লিঙ্ক: ${finalLink}`
        },
        { quoted: message }
      );

    } catch (error) {
      console.error("[CATBOX3 ERROR]", error);

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
» 🚨 আপলোড ব্যর্থ হয়েছে!
» 📡 পুনরায় চেষ্টা করুন।
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
      );

    } finally {
      if (filePath) {
        try {
          await fs.remove(filePath);
        } catch {}
      }
    }
  }
};
