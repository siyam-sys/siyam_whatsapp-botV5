
import { createCanvas, loadImage } from "@napi-rs/canvas";

const AUTHOR = "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦";

const BACKGROUND_URL = "https://i.postimg.cc/KYJ0VnK0/image0.png";

async function fetchImage(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Image download failed");
  }

  return Buffer.from(await response.arrayBuffer());
}

async function getAvatar(sock, userJid, size) {
  try {
    const url = await sock.profilePictureUrl(userJid, "image");
    const buffer = await fetchImage(url);
    const image = await loadImage(buffer);

    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(image, 0, 0, size, size);
    ctx.restore();

    return canvas;
  } catch {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#777777";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.floor(size / 2)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", size / 2, size / 2);

    return canvas;
  }
}

async function makeImage(sock, senderJid, targetJid) {
  const width = 640;
  const height = 480;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  try {
    const bgBuffer = await fetchImage(BACKGROUND_URL);
    const bg = await loadImage(bgBuffer);
    ctx.drawImage(bg, 0, 0, width, height);
  } catch {
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#222222";
    ctx.font = "bold 65px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BONK!", width / 2, 90);
  }

  // WhatsApp profile pictures
  const avatarOne = await getAvatar(sock, senderJid, 110);
  const avatarTwo = await getAvatar(sock, targetJid, 90);

  ctx.drawImage(avatarOne, 60, 150);
  ctx.drawImage(avatarTwo, 500, 220);

  return canvas.toBuffer("image/png");
}

function getMessageData(message) {
  let msg = message?.message || {};

  while (
    msg.ephemeralMessage ||
    msg.viewOnceMessage ||
    msg.viewOnceMessageV2 ||
    msg.documentWithCaptionMessage
  ) {
    msg =
      msg.ephemeralMessage?.message ||
      msg.viewOnceMessage?.message ||
      msg.viewOnceMessageV2?.message ||
      msg.documentWithCaptionMessage?.message ||
      msg;
  }

  return msg;
}

export default {
  config: {
    name: "bonk",
    aliases: ["b"],
    version: "1.0",
    author: AUTHOR,
    role: 0,
    category: "fun",
    description: "Bonk someone using WhatsApp profile pictures"
  },

  onStart: async function ({
    sock,
    message,
    args,
    jid,
    senderJid,
    reply
  }) {
    try {
      const msg = getMessageData(message);
      const contextInfo =
        msg.extendedTextMessage?.contextInfo ||
        msg.imageMessage?.contextInfo ||
        msg.videoMessage?.contextInfo ||
        {};

      let targetJid = null;

      // Reply target
      if (contextInfo.participant) {
        targetJid = contextInfo.participant;
      }

      // Mention target
      if (!targetJid && contextInfo.mentionedJid?.length) {
        targetJid = contextInfo.mentionedJid[0];
      }

      // UID or phone number
      if (!targetJid && args[0]) {
        const number = args[0].replace(/\D/g, "");

        if (number.length >= 8) {
          targetJid = `${number}@s.whatsapp.net`;
        }
      }

      if (!targetJid) {
        return reply(
          "⚠️ কাউকে Reply অথবা Mention করো, অথবা UID/Number দাও।\n\nExample: bonk 88017XXXXXXXX"
        );
      }

      if (
        targetJid === senderJid ||
        targetJid.split("@")[0] === senderJid.split("@")[0]
      ) {
        return reply("❌ নিজেকে Bonk করা যাবে না!");
      }

      const image = await makeImage(
        sock,
        senderJid,
        targetJid
      );

      const targetName = targetJid.split("@")[0];

      await sock.sendMessage(
        jid,
        {
          image,
          caption: `😂 ${targetName} BONK! 🪓`
        },
        {
          quoted: message
        }
      );

    } catch (error) {
      console.error("[BONK ERROR]", error);

      return reply(
        "❌ Bonk image তৈরি করা যায়নি। আবার চেষ্টা করো।"
      );
    }
  }
};
