
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import fs from "fs-extra";
import path from "node:path";
import axios from "axios";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { AUTHOR } from "../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCKED_AUTHOR = AUTHOR;

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

function normalizeJid(jid = "") {
  return String(jid).replace(/:\d+(?=@)/, "").trim();
}

async function downloadImage(url, timeout = 15000) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const buffer = Buffer.from(response.data);

  if (!buffer || buffer.length < 1024) {
    throw new Error("Invalid image data");
  }

  return buffer;
}

async function getAvatar(sock, targetJid) {
  try {
    const avatarUrl = await sock.profilePictureUrl(
      targetJid,
      "image"
    );

    if (!avatarUrl) {
      throw new Error("Profile picture unavailable");
    }

    return await downloadImage(avatarUrl, 15000);

  } catch (error) {
    console.error("[GORU AVATAR ERROR]", error.message);
    throw new Error("Could not fetch WhatsApp profile picture");
  }
}

async function getName(sock, targetJid) {
  try {
    const contact =
      sock.contacts?.[targetJid] ||
      sock.store?.contacts?.[targetJid] ||
      {};

    const name =
      contact.name ||
      contact.notify ||
      contact.verifiedName;

    if (name) return name;

    if (typeof sock.getName === "function") {
      const result = await sock.getName(targetJid);
      if (result) return result;
    }
  } catch (error) {
    console.error("[GORU NAME ERROR]", error.message);
  }

  if (targetJid.endsWith("@s.whatsapp.net")) {
    return targetJid.split("@")[0];
  }

  return "Someone";
}

export default {
  config: {
    name: "goru",
    aliases: ["cow"],
    version: "2.3",
    author: LOCKED_AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: "Expose someone as a Goru!",
    longDescription:
      "Puts the tagged/replied user's face on a cow's body (fun meme)",
    category: "fun",
    guide: "{pn} @mention অথবা কারো মেসেজে reply দাও 😂"
  },

  onStart: async function ({
    sock,
    message,
    jid,
    senderJid,
    reply
  }) {
    // 🔒 AUTHOR SECURITY LOCK
    if (this.config.author !== LOCKED_AUTHOR) {
      return reply("⛔ Author পরিবর্তন করা যাবে না!");
    }

    let waitMessage;

    try {
      const contextInfo = getContextInfo(message);

      const mentions = contextInfo?.mentionedJid || [];

      let targetJid = "";

      // Reply করা ব্যক্তিকে target করবে
      if (contextInfo?.quotedMessage) {
        targetJid = contextInfo.participant || "";

      // Mention করা ব্যক্তিকে target করবে
      } else if (mentions.length > 0) {
        targetJid = mentions[0];
      }

      targetJid = normalizeJid(targetJid);

      if (!targetJid) {
        return reply(
          "❗ কাউকে Mention করো অথবা তার মেসেজে Reply দাও, তাকে গরু বানানোর জন্য! 🐮"
        );
      }

      if (
        normalizeJid(targetJid) === normalizeJid(senderJid)
      ) {
        return reply(
          "❗ Bro, why would you cow yourself? 😂"
        );
      }

      waitMessage = await reply("⌛️ Wait kor...");

      // Cache directory
      const cacheDir = path.join(__dirname, "goru_cache");
      await fs.ensureDir(cacheDir);

      // Cow background image
      const bgPath = path.join(cacheDir, "cow_bg.jpg");

      let bgBuffer;

      if (await fs.pathExists(bgPath)) {
        bgBuffer = await fs.readFile(bgPath);
      } else {
        const cowImgUrl = "https://files.catbox.moe/ecebko.jpg";

        bgBuffer = await downloadImage(cowImgUrl, 20000);

        await fs.writeFile(bgPath, bgBuffer);
      }

      const bgImage = await loadImage(bgBuffer);

      // Target WhatsApp profile picture
      const avatarBuffer = await getAvatar(sock, targetJid);
      const avatarImage = await loadImage(avatarBuffer);

      // Create canvas
      const canvas = createCanvas(
        bgImage.width,
        bgImage.height
      );

      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImage, 0, 0);

      // Avatar position
      const avatarSize = 135;
      const headCenterX = 80 + avatarSize / 2;
      const headCenterY = 60 + avatarSize / 2;

      const avatarX = headCenterX - avatarSize / 2;
      const avatarY = headCenterY - avatarSize / 2;

      // Circular avatar
      ctx.save();

      ctx.beginPath();
      ctx.arc(
        headCenterX,
        headCenterY,
        avatarSize / 2,
        0,
        Math.PI * 2
      );

      ctx.closePath();
      ctx.clip();

      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.drawImage(
        avatarImage,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
      );

      ctx.restore();

      // Avatar border
      ctx.beginPath();

      ctx.arc(
        headCenterX,
        headCenterY,
        avatarSize / 2 + 1,
        0,
        Math.PI * 2
      );

      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text on image
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 5;

      ctx.fillText("Kire chdna", 40, 50);

      // Image buffer
      const outputBuffer = canvas.toBuffer("image/png");

      // Target name
      const tagName = await getName(sock, targetJid);

      // Send WhatsApp image with mention
      await sock.sendMessage(
        jid,
        {
          image: outputBuffer,
          caption:
            `😹\n@${tagName} একদম আসল গরু হয়েছে বিদেশী গরু! 🐮✨ আরো কর বস সিয়াম এর সাথে বিয়াদবি😴`,
          mentions: [targetJid]
        },
        {
          quoted: message
        }
      );

      // Remove waiting message
      if (waitMessage?.key) {
        try {
          await sock.sendMessage(jid, {
            delete: waitMessage.key
          });
        } catch (error) {
          console.log(
            "[GORU WAIT MESSAGE DELETE]",
            error.message
          );
        }
      }

    } catch (err) {
      console.error("❌ Goru Command Error:", err);

      return reply(
        "⚠️ something wrong, trying again 🙂"
      );
    }
  }
};
