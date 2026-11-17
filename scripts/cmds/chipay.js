
import axios from "axios";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { AUTHOR } from "../../config.js";

async function getImage(url) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 20000
  });
  return loadImage(Buffer.from(response.data));
}

function getContextInfo(message) {
  const content = message?.message || {};

  return (
    content.extendedTextMessage?.contextInfo ||
    content.imageMessage?.contextInfo ||
    content.videoMessage?.contextInfo ||
    content.documentMessage?.contextInfo ||
    content.buttonsResponseMessage?.contextInfo ||
    content.listResponseMessage?.contextInfo ||
    null
  );
}

function getMentionedJid(message) {
  const contextInfo = getContextInfo(message);
  return contextInfo?.mentionedJid?.[0] || null;
}

function getQuotedJid(message) {
  const contextInfo = getContextInfo(message);
  return contextInfo?.participant || null;
}

async function getProfileImage(sock, jid) {
  try {
    const url = await sock.profilePictureUrl(jid, "image");
    return await getImage(url);
  } catch {
    const fallback = await getImage("https://i.imgur.com/7k12EPD.png");
    return fallback;
  }
}

export default {
  config: {
    name: "chipay",
    aliases: ["corner", "চিপা"],
    version: "2.4.9",
    author: AUTHOR,
    role: 0,
    category: "fun",
    description: "Fun command with image and stylish caption",
    guide: "Reply to a message or mention someone"
  },

  onStart: async function ({ sock, message, jid, senderJid, reply }) {
    let targetJid = getMentionedJid(message);

    if (!targetJid) {
      targetJid = getQuotedJid(message);
    }

    if (!targetJid) {
      return reply("🤦‍♂️ | আরে ভাই, কাকে চিপায় নিবেন তারে তো মেনশন দেন নাই!");
    }

    try {
      await reply("⏳ | একটু দাঁড়ান, চিপায় ঝালমুড়ি খাওয়ার ব্যাবস্থা করতেছি... 😋");

      let targetName = "User";

      try {
        const metadata = jid.endsWith("@g.us")
          ? await sock.groupMetadata(jid)
          : null;

        const participant = metadata?.participants?.find(
          user => user.id === targetJid || user.lid === targetJid
        );

        targetName =
          participant?.notify ||
          participant?.name ||
          targetJid.split("@")[0];
      } catch {
        targetName = targetJid.split("@")[0];
      }

      const backgroundUrl = "https://i.imgur.com/PlmZXfJ.jpeg";

      const [bgImg, avtLeft, avtRight] = await Promise.all([
        getImage(backgroundUrl),
        getProfileImage(sock, targetJid),
        getProfileImage(sock, senderJid)
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      ctx.font = "bold 18px Arial";

      const textWidth = ctx.measureText(targetName).width;
      const textX = canvas.width - 100;
      const textY = canvas.height - 103;
      const padding = 10;
      const boxWidth = textWidth + padding * 2;
      const boxHeight = 28;
      const boxX = textX - boxWidth;
      const boxY = textY - 20;

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "right";
      ctx.fillText(targetName, textX - padding, textY);

      const avatarSizeLeft = 110;
      const avatarSizeUser = 95;

      const xLeft = 85;
      const yLeft = 85;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        xLeft + avatarSizeLeft / 2,
        yLeft + avatarSizeLeft / 2,
        avatarSizeLeft / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        avtLeft,
        xLeft,
        yLeft,
        avatarSizeLeft,
        avatarSizeLeft
      );
      ctx.restore();

      const xRight = 350;
      const yRight = 100;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        xRight + avatarSizeUser / 2,
        yRight + avatarSizeUser / 2,
        avatarSizeUser / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        avtRight,
        xRight,
        yRight,
        avatarSizeUser,
        avatarSizeUser
      );
      ctx.restore();

      const buffer = canvas.toBuffer("image/png");

      const caption =
        `😾⎯͢⎯⃝⋆⃝চিঁপাঁয়ঁ আঁয়ঁ ঝাঁলঁমুঁড়িঁ বাঁনাঁয়ঁছিঁ🙈 ⋆⃝⋆⃝😹😒⋆🐰🍒\n\n` +
        `${targetName} এ্ঁদিকে্ঁ আ্ঁসো্ঁ 😹🙈`;

      await sock.sendMessage(
        jid,
        {
          image: buffer,
          caption,
          mentions: [targetJid]
        },
        { quoted: message }
      );

    } catch (error) {
      console.error("CHIPAY ERROR:", error);
      return reply("🥭 | Error! Failed to process image. Please try again.");
    }
  }
};
