
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WhatsApp Baileys Cyberpunk Wanted Poster

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { AUTHOR } from "../../config.js";

const COMMAND_NAME = "Chemical";

const config = Object.freeze({
  name: COMMAND_NAME,
  aliases: ["bounty", "কেমিনাল", "ধরো"],
  version: "3.0",
  author: AUTHOR,
  role: 0,
  category: "fun",
  guide: "wanted @mention / মেসেজে রিপ্লাই দিয়ে wanted লিখুন",
  countDown: 5
});

// 🔒 AUTHOR LOCK SYSTEM
function isAuthorized() {
  return (
    config.author === AUTHOR &&
    config.name === COMMAND_NAME
  );
}

// Extract WhatsApp message content
function unwrapMessage(message) {
  let current = message?.message;

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

// Get mention and quoted-message information
function getContextInfo(message) {
  const root = unwrapMessage(message);

  return (
    root.extendedTextMessage?.contextInfo ||
    root.imageMessage?.contextInfo ||
    root.videoMessage?.contextInfo ||
    root.documentMessage?.contextInfo ||
    root.audioMessage?.contextInfo ||
    root.stickerMessage?.contextInfo ||
    null
  );
}

// Clean WhatsApp JID
function normalizeJid(jid = "") {
  return String(jid).replace(/:\d+(?=@)/, "").trim();
}

// Get readable WhatsApp number
function getJidNumber(jid = "") {
  const value = normalizeJid(jid);

  if (value.endsWith("@lid")) {
    return "WhatsApp User";
  }

  return value
    .split("@")[0]
    .replace(/\D/g, "") || "WhatsApp User";
}

// Get target profile name
async function getTargetName(sock, targetJid, senderJid, pushName) {
  try {
    if (
      normalizeJid(targetJid) === normalizeJid(senderJid) &&
      pushName
    ) {
      return pushName;
    }

    const contact = sock.contacts?.[targetJid] ||
      sock.contacts?.[normalizeJid(targetJid)];

    if (
      contact?.verifiedName ||
      contact?.notify ||
      contact?.name
    ) {
      return (
        contact.verifiedName ||
        contact.notify ||
        contact.name
      );
    }

    if (typeof sock.getName === "function") {
      const name = await sock.getName(targetJid);
      if (name) return name;
    }
  } catch (error) {
    console.error("[CHEMICAL NAME]", error.message);
  }

  return getJidNumber(targetJid);
}

// Get WhatsApp profile picture
async function getProfileImage(sock, targetJid) {
  try {
    const url = await sock.profilePictureUrl(
      targetJid,
      "image"
    );

    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Image HTTP ${response.status}`);
    }

    const buffer = Buffer.from(
      await response.arrayBuffer()
    );

    if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
      throw new Error("Invalid profile image size");
    }

    return await loadImage(buffer);

  } catch (error) {
    console.error("[CHEMICAL PROFILE]", error.message);
    return null;
  }
}

// Draw text with automatic font fitting
function drawFittedText(
  ctx,
  text,
  x,
  y,
  maxWidth,
  fontSize,
  color = "#ffffff"
) {
  let size = fontSize;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  do {
    ctx.font = `bold ${size}px sans-serif`;
    if (ctx.measureText(String(text)).width <= maxWidth) {
      break;
    }
    size--;
  } while (size > 16);

  ctx.fillStyle = color;
  ctx.fillText(String(text), x, y, maxWidth);
}

// Draw fallback avatar
function drawFallbackAvatar(ctx, x, y, size) {
  ctx.fillStyle = "#151520";
  ctx.fillRect(x, y, size, size);

  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, size, size);

  ctx.fillStyle = "#00f0ff";
  ctx.font = "bold 100px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", x + size / 2, y + size / 2);
}

// Generate wanted poster
async function createWantedPoster({
  targetName,
  userImg,
  randomCrime,
  formattedBounty
}) {
  const width = 800;
  const height = 1000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, width, height);

  // Background texture
  ctx.strokeStyle = "rgba(255, 0, 85, 0.15)";
  ctx.lineWidth = 1;

  for (let i = 0; i < height; i += 20) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // Neon red border
  ctx.shadowColor = "#ff0055";
  ctx.shadowBlur = 30;
  ctx.strokeStyle = "#ff0055";
  ctx.lineWidth = 8;
  ctx.strokeRect(25, 25, width - 50, height - 50);

  ctx.shadowBlur = 10;
  ctx.strokeStyle = "#ffe600";
  ctx.lineWidth = 2;
  ctx.strokeRect(35, 35, width - 70, height - 70);

  // Header
  ctx.shadowColor = "#ff0055";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#ff0055";
  ctx.font = "bold 90px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("WANTED", width / 2, 130);

  // Subheader
  ctx.fillStyle = "#ffe600";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(
    "DEAD OR ALIVE • CYBER CRIME DIVISION",
    width / 2,
    170
  );

  // Divider
  ctx.strokeStyle = "#ff0055";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 190);
  ctx.lineTo(width - 70, 190);
  ctx.stroke();

  // Profile image
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "#151520";
  ctx.fillRect(width / 2 - 180, 220, 360, 360);

  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 5;
  ctx.strokeRect(width / 2 - 180, 220, 360, 360);

  if (userImg) {
    ctx.drawImage(
      userImg,
      width / 2 - 170,
      230,
      340,
      340
    );
  } else {
    drawFallbackAvatar(
      ctx,
      width / 2 - 170,
      230,
      340
    );
  }

  // CRIMINAL stamp
  ctx.save();

  ctx.translate(width / 2, 390);
  ctx.rotate(-15 * Math.PI / 180);

  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 15;

  ctx.fillStyle = "rgba(255, 0, 0, 0.85)";
  ctx.fillRect(-160, -35, 320, 70);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(-160, -35, 320, 70);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CRIMINAL", 0, 12);

  ctx.restore();

  // Target name
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 10;

  drawFittedText(
    ctx,
    targetName,
    width / 2,
    630,
    680,
    36,
    "#ffffff"
  );

  // Crime information
  ctx.shadowColor = "#ff0055";
  ctx.shadowBlur = 10;

  ctx.fillStyle = "#ff0055";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "CRIME / অপরাধ:",
    width / 2,
    680
  );

  ctx.fillStyle = "#00f0ff";
  ctx.font = "22px sans-serif";

  drawFittedText(
    ctx,
    `"${randomCrime}"`,
    width / 2,
    720,
    660,
    22,
    "#00f0ff"
  );

  // Bounty reward box
  ctx.fillStyle = "#121520";
  ctx.fillRect(80, 760, width - 160, 120);

  ctx.strokeStyle = "#ffe600";
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 760, width - 160, 120);

  ctx.shadowColor = "#ffe600";
  ctx.shadowBlur = 15;

  ctx.fillStyle = "#ffe600";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(
    "💰 REWARD BOUNTY 💰",
    width / 2,
    800
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px sans-serif";
  ctx.fillText(
    formattedBounty,
    width / 2,
    855
  );

  // Footer
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ff0055";
  ctx.font = "bold 18px sans-serif";

  ctx.fillText(
    "─── 👑 OWNER: SIYAM-HASAN  |  🧚‍♀️ NIJHUM CHATBOT ───",
    width / 2,
    940
  );

  return canvas.toBuffer("image/png");
}

export default {
  config,

  onStart: async function ({
    sock,
    message,
    jid,
    senderJid,
    pushName,
    reply
  }) {
    try {
      // 🔒 AUTHOR LOCK SYSTEM
      if (!isAuthorized()) {
        return reply(
          "⛔ This file is locked!\nAuthor change detected."
        );
      }

      if (!sock || !jid || !message) {
        return reply("❌ WhatsApp message information পাওয়া যায়নি।");
      }

      // Detect mentions and replied messages
      const contextInfo = getContextInfo(message);

      const mentions = contextInfo?.mentionedJid || [];

      let targetJid;

      if (mentions.length > 0) {
        targetJid = mentions[0];

      } else if (contextInfo?.quotedMessage) {
        targetJid =
          contextInfo.participant ||
          contextInfo.participantAlt ||
          senderJid;

      } else {
        targetJid = senderJid;
      }

      targetJid = normalizeJid(targetJid);

      if (!targetJid) {
        return reply("❌ Target WhatsApp user পাওয়া যায়নি।");
      }

      // Get target name
      const targetName = await getTargetName(
        sock,
        targetJid,
        senderJid,
        pushName
      );

      // Random crime
      const crimes = [
        "রাত ২টায় বিরিয়ানির ছবি দিয়ে বন্ধুদের লোভ দেখানো!",
        "সব মেসেজ দেখেও সিন (Seen) করে রিপ্লাই না দেওয়া!",
        "গ্রুপে এসে আজেবাজে স্টিকার দিয়ে চ্যাট ভাসিয়ে দেওয়া!",
        "অনলাইন প্রেমে মিথ্যা আশ্বাস দিয়ে মন ভাঙা!",
        "প্রচুর পড়াশোনা করে পরীক্ষার আগে 'কিছুই পড়িনি' বলা!"
      ];

      const randomCrime =
        crimes[Math.floor(Math.random() * crimes.length)];

      // $5,000,000 to $49,000,000 bounty
      const bountyAmount =
        (Math.floor(Math.random() * 45) + 5) * 1000000;

      const formattedBounty =
        "$" + bountyAmount.toLocaleString("en-US");

      // Get WhatsApp profile picture
      const userImg = await getProfileImage(
        sock,
        targetJid
      );

      // Generate poster
      const posterBuffer = await createWantedPoster({
        targetName,
        userImg,
        randomCrime,
        formattedBounty
      });

      // Original message design
      const msgText =
`» 👑 𝗢𝗪𝗡𝗘𝗥 : 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
───────────────
🚨 𝗪𝗔𝗡𝗧𝗘𝗗 𝗔𝗟𝗘𝗥𝗧 🚨
───────────────
👤 নাম: ${targetName}
📌 অপরাধ: ${randomCrime}
💰 জরিমানা: ${formattedBounty}

⚠️ একে দেখলে দ্রুত 
❎ সিয়াম ভাই কে খবর দিন!
───────────────
» 🧚‍♀️ 𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      // Send poster to WhatsApp
      await sock.sendMessage(
        jid,
        {
          image: posterBuffer,
          mimetype: "image/png",
          caption: msgText
        },
        { quoted: message }
      );

    } catch (error) {
      console.error("[CHEMICAL COMMAND]", error);

      const errorMessage =
        "❌ ওয়ান্টেড পোস্টার তৈরি করতে সমস্যা হয়েছে সিয়াম!";

      try {
        if (typeof reply === "function") {
          await reply(errorMessage);
        } else {
          await sock.sendMessage(
            jid,
            { text: errorMessage },
            { quoted: message }
          );
        }
      } catch (sendError) {
        console.error("[CHEMICAL ERROR REPLY]", sendError);
      }
    }
  }
};
