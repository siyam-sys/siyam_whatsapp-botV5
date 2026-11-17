
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import axios from "axios";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AUTHOR } from "../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Original author security
const OWNER_NAME = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const ANTI_TAMPER = "𝆠፝";
const hiddenOwner = ANTI_TAMPER + OWNER_NAME;

const EXPECTED_OWNER = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const LOCKED_AUTHOR = AUTHOR;

function normalizeJid(jid = "") {
  return String(jid).replace(/:\d+(?=@)/, "").trim();
}

function getContextInfo(message) {
  let msg = message?.message;

  for (let i = 0; i < 5; i++) {
    const next =
      msg?.ephemeralMessage?.message ||
      msg?.viewOnceMessage?.message ||
      msg?.viewOnceMessageV2?.message ||
      msg?.documentWithCaptionMessage?.message;

    if (!next) break;
    msg = next;
  }

  return (
    msg?.extendedTextMessage?.contextInfo ||
    msg?.imageMessage?.contextInfo ||
    msg?.videoMessage?.contextInfo ||
    msg?.documentMessage?.contextInfo ||
    null
  );
}

export default {
  config: {
    name: "ad",
    version: "1.0",
    author: LOCKED_AUTHOR,
    sourceAuthor: hiddenOwner,
    countDown: 10,
    role: 0,

    shortDescription: "Generate ad style image",
    longDescription:
      "Creates ad style meme image from profile picture",

    category: "𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘",

    guide:
      "{pn}\n" +
      "{pn} @mention\n" +
      "কারো মেসেজে Reply + {pn}"
  },

  onStart: async function ({
    sock,
    message,
    jid,
    senderJid,
    reply
  }) {
    let filePath = null;

    try {
      // Author security lock
      if (
        hiddenOwner !== EXPECTED_OWNER ||
        this.config.author !== LOCKED_AUTHOR
      ) {
        return reply(
          "⛔ Author security check failed!"
        );
      }

      const contextInfo = getContextInfo(message);
      const mentions = contextInfo?.mentionedJid || [];

      let targetJid;

      // Mention করা ব্যক্তির JID
      if (mentions.length > 0) {
        targetJid = mentions[0];
      }

      // Reply করা ব্যক্তির JID
      else if (contextInfo?.quotedMessage) {
        targetJid = contextInfo.participant;
      }

      // নিজের প্রোফাইল
      else {
        targetJid = senderJid;
      }

      targetJid = normalizeJid(targetJid);

      if (!targetJid) {
        return reply(
          "❌ ইউজার শনাক্ত করা যায়নি!"
        );
      }

      // Get WhatsApp profile picture
      let avatarURL;

      try {
        avatarURL = await sock.profilePictureUrl(
          targetJid,
          "image"
        );
      } catch (error) {
        console.error(
          "[AD PROFILE ERROR]",
          error.message
        );

        return reply(
          "❌ এই ইউজারের WhatsApp প্রোফাইল ছবি পাওয়া যায়নি।"
        );
      }

      if (!avatarURL) {
        return reply(
          "❌ প্রোফাইল ছবি পাওয়া যায়নি।"
        );
      }

      // Original Popcat API
      const apiURL =
        `https://api.popcat.xyz/v2/ad?image=${encodeURIComponent(avatarURL)}`;

      // Generate ad image
      const res = await axios.get(apiURL, {
        responseType: "arraybuffer",
        timeout: 30000,
        maxContentLength: 15 * 1024 * 1024,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const contentType =
        res.headers["content-type"] || "";

      if (!contentType.includes("image/")) {
        throw new Error("API did not return an image");
      }

      const imageBuffer = Buffer.from(res.data);

      if (!imageBuffer.length) {
        throw new Error("Empty image response");
      }

      // Cache folder
      const cacheFolder = path.join(
        __dirname,
        "cache"
      );

      await fs.ensureDir(cacheFolder);

      filePath = path.join(
        cacheFolder,
        `ad_${Date.now()}.png`
      );

      await fs.writeFile(filePath, imageBuffer);

      // Send generated image to WhatsApp
      await sock.sendMessage(
        jid,
        {
          image: imageBuffer,
          caption:
            "📢কিরে শালা 😁তর এড দিয়া 😂ভাইরাল কইরা দিলাম🐸"
        },
        {
          quoted: message
        }
      );

    } catch (err) {
      console.error("[AD COMMAND ERROR]", err);

      return reply(
        "❌ | Failed to generate ad image."
      );

    } finally {
      // Delete temporary image
      if (filePath) {
        try {
          await fs.remove(filePath);
        } catch (error) {
          console.error(
            "[AD CLEANUP ERROR]",
            error.message
          );
        }
      }
    }
  }
};
                             
