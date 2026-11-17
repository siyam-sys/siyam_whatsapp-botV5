// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// Baileys image-reply support. Requires: npm install @napi-rs/canvas

import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const MODEL_VERSION = "Local DSLR Color Enhance";
const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MAX_OUTPUT_PIXELS = 16_000_000;

function unwrapMessage(message) {
  let current = message;
  for (let i = 0; i < 5; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.documentWithCaptionMessage?.message;
    if (!next) break;
    current = next;
  }
  return current || {};
}

function findImage(message) {
  const root = unwrapMessage(message?.message);
  const context =
    root.extendedTextMessage?.contextInfo ||
    root.imageMessage?.contextInfo ||
    root.documentMessage?.contextInfo ||
    root.videoMessage?.contextInfo;

  const quoted = unwrapMessage(context?.quotedMessage);
  if (quoted.imageMessage) return quoted.imageMessage;
  if (root.imageMessage) return root.imageMessage;

  return null;
}

async function downloadImage(imageMessage) {
  const stream = await downloadContentFromMessage(imageMessage, "image");
  const chunks = [];
  let size = 0;

  for await (const chunk of stream) {
    size += chunk.length;
    if (size > MAX_INPUT_BYTES) {
      throw new Error("ছবির সাইজ 15MB-এর বেশি। ছোট ছবি পাঠাও।");
    }
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  if (!buffer.length) throw new Error("ছবিটি ডাউনলোড করা যায়নি।");
  return buffer;
}

function enhancePixels(data, level) {
  const contrast = ({ "1": 1.10, "2": 1.14, "3": 1.18, "4": 1.20, "5": 1.22 })[level];
  const bright = ({ "1": 4, "2": 4, "3": 6, "4": 8, "5": 10 })[level];
  const skinSat = ({ "1": 1.08, "2": 1.10, "3": 1.10, "4": 1.12, "5": 1.15 })[level];
  const otherSat = ({ "1": 1.15, "2": 1.20, "3": 1.20, "4": 1.25, "5": 1.30 })[level];

  for (let i = 0; i < data.length; i += 4) {
    let r = (data[i] - 128) * contrast + 128 + bright;
    let g = (data[i + 1] - 128) * contrast + 128 + bright + 2;
    let b = (data[i + 2] - 128) * contrast + 128 + bright + 5;

    const avg = (r + g + b) / 3;
    const likelySkin = r > 90 && g > 60 && b > 50 && r > b;
    const saturation = likelySkin ? skinSat : otherSat;

    r = avg + (r - avg) * saturation;
    g = avg + (g - avg) * saturation;
    b = avg + (b - avg) * saturation;

    if (likelySkin) {
      r *= 1.04;
      g *= 1.02;
      b *= 1.01;
    }

    data[i] = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }
}

export default {
  config: {
    name: "4k",
    aliases: ["hd", "enhance", "remini", "hdr", "8k"],
    version: "2.0.0",
    author: "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦",
    role: "USER",
    shortDescription: "Photo color enhancement and upscale",
    longDescription: "Enhances and enlarges a replied-to or directly attached photo.",
    category: "IMAGE",
    usage: "{pn} [1-5] + reply to a photo"
  },

  onStart: async ({ sock, jid, message, args = [], reply }) => {
    const imageMessage = findImage(message);

    if (!imageMessage) {
      return reply(
        `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 📸 Model: ${MODEL_VERSION}

» ব্যবহার:
» ছবিতে Reply দিয়ে /4k
» /4k 1 = Low HD
» /4k 2 = Natural HD
» /4k 3 = DSLR 4K
» /4k 4 = DSLR 8K-style
» /4k 5 = DSLR 16K-style

» ছবির ক্যাপশনে সরাসরি /4k 1-5 লিখেও পাঠাতে পারো।
───────────────`
      );
    }

    const level = ["1", "2", "3", "4", "5"].includes(args[0]) ? args[0] : "5";
    const levelName = {
      "1": "LOW HD",
      "2": "NATURAL HD",
      "3": "DSLR 4K STYLE",
      "4": "DSLR 8K STYLE",
      "5": "DSLR 16K STYLE"
    }[level];

    try {
      await reply(`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 📸 Mode: ${levelName}
» 🌸 Natural color enhancement
» ⏳ ছবিটি প্রসেস হচ্ছে...`);

      const inputBuffer = await downloadImage(imageMessage);
      const img = await loadImage(inputBuffer);

      if (!img.width || !img.height) {
        throw new Error("ছবির dimension পড়া যায়নি।");
      }

      const requestedScale = ({ "1": 1.4, "2": 1.6, "3": 2, "4": 2.4, "5": 2.8 })[level];
      const safeScale = Math.min(
        requestedScale,
        Math.sqrt(MAX_OUTPUT_PIXELS / (img.width * img.height))
      );
      const scale = Math.max(1, safeScale);
      const width = Math.max(1, Math.floor(img.width * scale));
      const height = Math.max(1, Math.floor(img.height * scale));

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      enhancePixels(imageData.data, level);
      ctx.putImageData(imageData, 0, 0);

      const output = canvas.toBuffer("image/jpeg", 0.94);
      const caption = `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ✅ Success: ${levelName}
» 📐 ${img.width}×${img.height} ➜ ${width}×${height}
» 🌸 Natural color enhancement
» 👑 Author: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
───────────────
» Note: এটি local upscale ও color enhancement; AI দিয়ে নতুন facial detail তৈরি করে না।`;

      await sock.sendMessage(
        jid,
        { image: output, mimetype: "image/jpeg", caption },
        message ? { quoted: message } : {}
      );
    } catch (error) {
      console.error("[4K COMMAND]", error);
      await reply(`❌ ছবি প্রসেস করা যায়নি।
কারণ: ${error.message || "Unknown error"}
আবার চেষ্টা করো।`);
    }
  }
};
