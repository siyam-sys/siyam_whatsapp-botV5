
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// Advanced Welcome System for RJ-siyam WhatsApp Bot V5

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { AUTHOR, CONFIG } from "../../config.js";
import { getGroup } from "../../database/groups.js";

const SPECIAL_GROUP_JID = process.env.SPECIAL_WELCOME_GROUP || "";

const BACKGROUND_IMAGES = [
  "https://i.imgur.com/XVRFwns.jpeg",
  "https://i.imgur.com/DXXvgjb.png",
  "https://i.imgur.com/LwoDuzZ.jpeg",
  "https://i.imgur.com/mtSrSYh.jpeg",
  "https://i.imgur.com/IVvEBc4.jpeg",
  "https://i.imgur.com/uJcd1bf.jpeg"
];

const BOT_JOIN_IMAGES = [
  "https://i.imgur.com/y5a5BBP.jpeg",
  "https://i.imgur.com/586Aq55.jpeg"
];

const BACKGROUND_CACHE = new Map();

const SPECIAL_RULES = `📢 স্বাগতম @USER

『░⃟̎̎̎̎̐𝄞𝐅𝐑𝐈𝐄𝐍𝐃𝐒' 𝄟≛⃝𝐕𝐈𝐃𝐄𝐎≛⃝𝄟𝐁𝐎𝐗░⃟̎̎̎̎̐』

          📜 𝐕𝐈𝐃𝐄𝐎 𝐁𝐎𝐗 𝐑𝐔𝐋𝐄𝐒

⚠️ গ্রুপে থাকলে নিচের নিয়মগুলো অবশ্যই মেনে চলতে হবে।

1️⃣ শুধুমাত্র ভিডিও দেওয়া যাবে।

2️⃣ ১৮+ বা অশ্লীল কোনো ভিডিও/কনটেন্ট সম্পূর্ণ নিষিদ্ধ।

3️⃣ অপ্রয়োজনীয় মেনশন (@) অথবা স্পিকার সম্পূর্ণ নিষিদ্ধ।

4️⃣ ইনবক্সে বিরক্ত করা বা গ্রুপ থেকে ইনবক্সে ডাকা যাবে না।

5️⃣ গালাগালি, ঝগড়া, অপমানজনক ভাষা ও ধর্মীয়/রাজনৈতিক বিতর্ক নিষিদ্ধ।

6️⃣ স্প্যাম, ফ্লাড বা একই পোস্ট বারবার দেওয়া যাবে না।

7️⃣ অন্য গ্রুপ বা পেজের অযথা প্রচার নিষিদ্ধ।

8️⃣ একটি ভিডিওতে কমপক্ষে ৫টি রিয়্যাক্ট না হওয়া পর্যন্ত দ্বিতীয় ভিডিও দেওয়া নিষিদ্ধ।

9️⃣ অ্যাডমিন বা মডারেটরের সিদ্ধান্ত সবাইকে সম্মান করতে হবে।

🔟 কোনো সমস্যা হলে সরাসরি অ্যাডমিনের সাথে যোগাযোগ করুন।

1️⃣1️⃣ নিয়ম ভঙ্গ করলে কিক বা রিমুভ করা হতে পারে।

━━━━━━━━━━━━━━━━━━

𝗢𝗪𝗡𝗘𝗥 ➜ 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦`;

// ===============================
// BASIC HELPERS
// ===============================

function normalizeJid(jid = "") {
  return String(jid)
    .split(":")[0]
    .trim()
    .toLowerCase();
}

function isBotJid(jid, botJid) {
  if (!jid || !botJid) return false;

  const a = normalizeJid(jid);
  const b = normalizeJid(botJid);

  return a === b;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getNumber(jid = "") {
  return String(jid).split("@")[0].split(":")[0];
}

function shorten(text = "", max = 35) {
  const value = String(text || "Unknown");

  return value.length > max
    ? value.slice(0, max - 3) + "..."
    : value;
}

async function downloadImage(url) {
  if (!url) return null;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (!buffer.length || buffer.length > 10 * 1024 * 1024) {
      throw new Error("Invalid image size");
    }

    return await loadImage(buffer);

  } catch (error) {
    console.error("[WELCOME] Image download error:", error.message);
    return null;
  }
}

async function getBackground(url) {
  if (!BACKGROUND_CACHE.has(url)) {
    const promise = downloadImage(url);
    BACKGROUND_CACHE.set(url, promise);
  }

  const image = await BACKGROUND_CACHE.get(url);

  return image;
}

async function getProfileImage(sock, jid) {
  try {
    if (!jid) return null;

    const url = await sock.profilePictureUrl(jid, "image");

    return await downloadImage(url);

  } catch {
    return null;
  }
}

function drawCircleImage(ctx, image, x, y, size, borderColor, fallback = "U") {
  const radius = size / 2;

  ctx.save();

  // Shadow
  ctx.shadowColor = borderColor;
  ctx.shadowBlur = 18;

  ctx.beginPath();
  ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
  ctx.fillStyle = borderColor;
  ctx.fill();

  ctx.shadowBlur = 0;

  // Border
  ctx.beginPath();
  ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Clip
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();

  if (image) {
    ctx.drawImage(
      image,
      x - radius,
      y - radius,
      size,
      size
    );
  } else {
    ctx.fillStyle = "#374151";
    ctx.fillRect(
      x - radius,
      y - radius,
      size,
      size
    );

    ctx.fillStyle = borderColor;
    ctx.font = `bold ${radius}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fallback, x, y);
  }

  ctx.restore();
}

function drawText(ctx, text, x, y, maxWidth, font, color) {
  ctx.save();

  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    shorten(text, 45),
    x,
    y,
    maxWidth
  );

  ctx.restore();
}

// ===============================
// WELCOME CARD GENERATOR
// ===============================

async function createWelcomeCard({
  groupImage,
  userImage,
  adderImage,
  userName,
  memberCount,
  groupName,
  adderName
}) {
  const width = 1200;
  const height = 700;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  const background = await getBackground(randomItem(BACKGROUND_IMAGES));

  if (background) {
    ctx.drawImage(background, 0, 0, width, height);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, width, height);

    gradient.addColorStop(0, "#111827");
    gradient.addColorStop(1, "#312e81");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Dark overlay
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 4;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Profile images
  drawCircleImage(
    ctx,
    groupImage,
    width / 2,
    150,
    175,
    "#ffffff",
    "G"
  );

  drawCircleImage(
    ctx,
    userImage,
    125,
    height - 115,
    145,
    "#10b981",
    "U"
  );

  drawCircleImage(
    ctx,
    adderImage,
    width - 125,
    110,
    145,
    "#3b82f6",
    "A"
  );

  // Group name
  drawText(
    ctx,
    groupName,
    width / 2,
    270,
    850,
    'bold 34px Arial',
    "#ffffff"
  );

  // WELCOME gradient
  const welcomeGradient = ctx.createLinearGradient(
    350, 350, 850, 350
  );

  welcomeGradient.addColorStop(0, "#3b82f6");
  welcomeGradient.addColorStop(0.5, "#10b981");
  welcomeGradient.addColorStop(1, "#ec4899");

  ctx.font = 'bold 82px Arial';
  ctx.fillStyle = welcomeGradient;
  ctx.textAlign = "center";

  ctx.fillText("WELCOME", width / 2, 400);

  // Divider
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(400, 425);
  ctx.lineTo(800, 425);
  ctx.stroke();

  // User name
  drawText(
    ctx,
    userName,
    width / 2,
    485,
    800,
    'bold 45px Arial',
    "#ffffff"
  );

  // Member count
  drawText(
    ctx,
    `MEMBER #${memberCount}`,
    width / 2,
    545,
    700,
    'bold 30px Arial',
    "#e2e8f0"
  );

  // Added by
  ctx.textAlign = "right";
  ctx.fillStyle = "#60a5fa";
  ctx.font = 'bold 22px Arial';

  ctx.fillText(
    `Added by: ${shorten(adderName, 22)}`,
    width - 35,
    210
  );

  // Bottom user label
  ctx.textAlign = "left";
  ctx.fillStyle = "#34d399";
  ctx.font = 'bold 23px Arial';

  ctx.fillText(
    shorten(userName, 20),
    215,
    height - 95
  );

  // Footer
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "16px Arial";

  ctx.fillText(
    "© RJ-siyam WhatsApp Bot V5",
    width - 30,
    height - 25
  );

  return canvas.toBuffer("image/png");
}

// ===============================
// BOT JOIN NOTIFICATION
// ===============================

async function sendBotJoinNotice(sock, groupJid, groupName, memberCount) {
  const prefix = CONFIG.PREFIX || "/";

  const caption =
    `✨ 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 ✨\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👋 হ্যালো সবাই!\n\n` +
    `🤖 আমি ${CONFIG.BOT_NAME}\n` +
    `❤️ আমাকে গ্রুপে Add করার জন্য ধন্যবাদ।\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📌 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢\n` +
    `» 👥 MEMBERS: ${memberCount}\n` +
    `» 🏷️ GROUP: ${groupName}\n` +
    `» 🤖 PREFIX: ${prefix}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📖 𝗚𝗘𝗧 𝗦𝗧𝗔𝗥𝗧𝗘𝗗\n` +
    `» ${prefix}help — সকল কমান্ড দেখুন\n` +
    `» ${prefix}bot — বটের তথ্য দেখুন\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👑 𝗢𝗪𝗡𝗘𝗥 : 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦\n\n` +
    `🌸 সবাইকে স্বাগতম!`;

  try {
    await sock.sendMessage(groupJid, {
      image: {
        url: randomItem(BOT_JOIN_IMAGES)
      },
      caption
    });

  } catch (error) {
    console.error("[WELCOME] Bot join image failed:", error.message);

    await sock.sendMessage(groupJid, {
      text: caption
    });
  }
}

// ===============================
// NORMAL MEMBER WELCOME
// ===============================

async function sendMemberWelcome({
  sock,
  groupJid,
  participant,
  groupName,
  memberCount,
  adderJid
}) {
  const userNumber = getNumber(participant);

  let userName = userNumber || "New Member";
  let adderName = "Unknown";

  try {
    userName = await sock.getName?.(participant) || userName;
  } catch {}

  if (adderJid) {
    try {
      adderName = await sock.getName?.(adderJid) || getNumber(adderJid);
    } catch {
      adderName = getNumber(adderJid);
    }
  }

  const [groupImage, userImage, adderImage] = await Promise.all([
    getProfileImage(sock, groupJid),
    getProfileImage(sock, participant),
    getProfileImage(sock, adderJid)
  ]);

  let imageBuffer = null;

  try {
    imageBuffer = await createWelcomeCard({
      groupImage,
      userImage,
      adderImage,
      userName,
      memberCount,
      groupName,
      adderName
    });
  } catch (error) {
    console.error("[WELCOME] Card generation failed:", error.message);
  }

  const caption =
    `🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌸\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🌷 𝐍𝐚𝐦𝐞: @${userNumber}\n` +
    `🏷️ 𝐆𝐫𝐨𝐮𝐩: ${groupName}\n` +
    `🔢 𝐌𝐞𝐦𝐛𝐞𝐫 #${memberCount}\n` +
    `👤 𝐀𝐝𝐝𝐞𝐝 𝐛𝐲: ${adderName}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `𝐄𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐬𝐭𝐚𝐲! 😊`;

  if (imageBuffer) {
    await sock.sendMessage(groupJid, {
      image: imageBuffer,
      caption,
      mentions: [participant]
    });
  } else {
    await sock.sendMessage(groupJid, {
      text: caption,
      mentions: [participant]
    });
  }
}

// ===============================
// EVENT MODULE
// ===============================

export default {
  config: {
    name: "welcome",
    event: "group-participants.update",
    version: "3.0.0",
    author: AUTHOR,
    description: "Advanced Welcome Card and Bot Join Notification"
  },

  onStart: async ({ sock, data }) => {
    if (!data || data.action !== "add" || !data.id) return;

    const groupJid = data.id;

    if (!groupJid.endsWith("@g.us")) return;

    try {
      let groupName = "WhatsApp Group";
      let memberCount = 0;

      // Group metadata
      try {
        const metadata = await sock.groupMetadata(groupJid);

        groupName = metadata.subject || groupName;
        memberCount = metadata.participants?.length || 0;

      } catch (error) {
        console.error("[WELCOME] Metadata error:", error.message);
      }

      const botJid = sock.user?.id || "";

      // Check if bot itself was added
      const botAdded = (data.participants || []).some(
        participant => isBotJid(participant, botJid)
      );

      // Bot join notice works independently of normal welcome setting
      if (botAdded) {
        await sendBotJoinNotice(
          sock,
          groupJid,
          groupName,
          memberCount
        );
      }

      // Check group welcome settings
      const groupSettings = await getGroup(groupJid);

      if (groupSettings?.welcome === false) return;

      // Special group rules
      if (SPECIAL_GROUP_JID && groupJid === SPECIAL_GROUP_JID) {
        for (const participant of data.participants || []) {
          if (isBotJid(participant, botJid)) continue;

          const userNumber = getNumber(participant);

          await sock.sendMessage(groupJid, {
            text: SPECIAL_RULES.replace("USER", userNumber),
            mentions: [participant]
          });
        }

        return;
      }

      // Welcome all newly added members
      for (const participant of data.participants || []) {
        if (isBotJid(participant, botJid)) continue;

        try {
          await sendMemberWelcome({
            sock,
            groupJid,
            participant,
            groupName,
            memberCount,
            adderJid: data.author || ""
          });

        } catch (error) {
          console.error(
            `[WELCOME] Failed for ${participant}:`,
            error.message
          );

          // Final fallback
          try {
            await sock.sendMessage(groupJid, {
              text:
                `🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌸\n\n` +
                `স্বাগতম @${getNumber(participant)}!\n` +
                `🏷️ Group: ${groupName}\n` +
                `🌟 আমাদের গ্রুপে আপনাকে স্বাগতম।`,
              mentions: [participant]
            });
          } catch (sendError) {
            console.error("[WELCOME] Fallback failed:", sendError.message);
          }
        }
      }

    } catch (error) {
      console.error("[WELCOME EVENT ERROR]:", error);
    }
  }
};
