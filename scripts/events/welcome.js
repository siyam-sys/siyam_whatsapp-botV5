// AUTHOR: RJ siyam
// WhatsApp Welcome Card - text is rendered after all images for reliable visibility.

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { AUTHOR, CONFIG } from "../../config.js";
import { getGroup } from "../../database/groups.js";

const SPECIAL_GROUP_JID = process.env.SPECIAL_WELCOME_GROUP || "";
const BACKGROUNDS = [
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
OWNER ➜ RJ siyam`;

const cache = new Map();

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
function jidNumber(jid = "") {
  return String(jid).split("@")[0].split(":")[0];
}
function normalizeJid(jid = "") {
  return String(jid).split(":")[0].trim().toLowerCase();
}
function sameJid(a, b) {
  return Boolean(a && b && normalizeJid(a) === normalizeJid(b));
}
function safeText(value, fallback = "Unknown") {
  const text = String(value ?? "").trim();
  return text || fallback;
}
function shorten(value, max = 34) {
  const text = safeText(value);
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

async function getImage(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = Buffer.from(await response.arrayBuffer());
    if (!data.length || data.length > 10 * 1024 * 1024) return null;
    return await loadImage(data);
  } catch (error) {
    console.error("[WELCOME] Image load:", error.message);
    return null;
  }
}

async function getCachedBackground(url) {
  if (!cache.has(url)) cache.set(url, getImage(url));
  return cache.get(url);
}

async function getProfile(sock, jid) {
  if (!jid) return null;
  try {
    const url = await sock.profilePictureUrl(jid, "image");
    return await getImage(url);
  } catch {
    return null;
  }
}

function drawCover(ctx, image, width, height) {
  if (!image) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#101827");
    gradient.addColorStop(1, "#312e81");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  const scale = Math.max(width / image.width, height / image.height);
  const sw = width / scale;
  const sh = height / scale;
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, 0, 0, width, height);
}

function drawAvatar(ctx, image, x, y, size, color, fallback) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(x, y, size / 2 + 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.clip();
  if (image) {
    ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
  } else {
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.floor(size * 0.42)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fallback, x, y);
  }
  ctx.restore();
}

function drawLabel(ctx, text, x, y, size, color = "#ffffff", align = "center") {
  ctx.save();
  ctx.font = `bold ${size}px Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 7;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.strokeText(String(text), x, y, 1050);
  ctx.fillText(String(text), x, y, 1050);
  ctx.restore();
}

async function createWelcomeCard({ sock, groupJid, participant, adderJid, groupName, userName, adderName, memberCount }) {
  const width = 1200;
  const height = 700;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const [background, groupImage, userImage, adderImage] = await Promise.all([
    getCachedBackground(pick(BACKGROUNDS)),
    getProfile(sock, groupJid),
    getProfile(sock, participant),
    getProfile(sock, adderJid)
  ]);

  drawCover(ctx, background, width, height);
  ctx.fillStyle = "rgba(0,0,0,0.56)";
  ctx.fillRect(0, 0, width, height);

  // All text is drawn AFTER background and profile images.
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  drawAvatar(ctx, groupImage, width / 2, 125, 150, "#ffffff", "G");
  drawAvatar(ctx, userImage, 115, 575, 132, "#10b981", "U");
  drawAvatar(ctx, adderImage, 1085, 115, 120, "#3b82f6", "A");

  drawLabel(ctx, shorten(groupName, 42), width / 2, 235, 32);
  drawLabel(ctx, "WELCOME", width / 2, 345, 82, "#38e8ad");

  ctx.save();
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(380, 395);
  ctx.lineTo(820, 395);
  ctx.stroke();
  ctx.restore();

  drawLabel(ctx, shorten(userName, 34), width / 2, 465, 42);
  drawLabel(ctx, `MEMBER #${memberCount}`, width / 2, 525, 28, "#e2e8f0");
  drawLabel(ctx, `Added by: ${shorten(adderName, 24)}`, width - 35, 205, 22, "#93c5fd", "right");
  drawLabel(ctx, shorten(userName, 22), 205, 635, 20, "#6ee7b7", "left");
  drawLabel(ctx, "RJ-siyam WhatsApp Bot V5", width - 35, 665, 16, "#ffffff", "right");

  return canvas.toBuffer("image/png");
}

async function sendBotJoinNotice(sock, groupJid, groupName, memberCount) {
  const prefix = CONFIG.PREFIX || "/";
  const caption =
    `✨ 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 ✨\n━━━━━━━━━━━━━━━━━━\n` +
    `👋 হ্যালো সবাই!\n\n🤖 আমি ${CONFIG.BOT_NAME || "WhatsApp Bot"}\n` +
    `❤️ আমাকে গ্রুপে Add করার জন্য ধন্যবাদ।\n\n━━━━━━━━━━━━━━━━━━\n` +
    `📌 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢\n» 👥 MEMBERS: ${memberCount}\n` +
    `» 🏷️ GROUP: ${groupName}\n» 🤖 PREFIX: ${prefix}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n📖 𝗚𝗘𝗧 𝗦𝗧𝗔𝗥𝗧𝗘𝗗\n` +
    `» ${prefix}help — সকল কমান্ড দেখুন\n» ${prefix}bot — বটের তথ্য দেখুন\n\n` +
    `👑 𝗢𝗪𝗡𝗘𝗥 : RJ siyam\n🌸 সবাইকে স্বাগতম!`;

  try {
    await sock.sendMessage(groupJid, { image: { url: pick(BOT_JOIN_IMAGES) }, caption });
  } catch (error) {
    console.error("[WELCOME] Bot join image failed:", error.message);
    await sock.sendMessage(groupJid, { text: caption });
  }
}

async function sendMemberWelcome({ sock, groupJid, participant, groupName, memberCount, adderJid }) {
  let userName = jidNumber(participant) || "New Member";
  let adderName = adderJid ? jidNumber(adderJid) : "Unknown";
  try {
    userName = await sock.getName?.(participant) || userName;
  } catch {}
  if (adderJid) {
    try {
      adderName = await sock.getName?.(adderJid) || adderName;
    } catch {}
  }

  const imageBuffer = await createWelcomeCard({
    sock, groupJid, participant, adderJid, groupName, userName, adderName, memberCount
  });
  const number = jidNumber(participant);
  const caption =
    `🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌸\n━━━━━━━━━━━━━━━━━━\n` +
    `🌷 𝐍𝐚𝐦𝐞: @${number}\n🏷️ 𝐆𝐫𝐨𝐮𝐩: ${groupName}\n` +
    `🔢 𝐌𝐞𝐦𝐛𝐞𝐫 #${memberCount}\n👤 𝐀𝐝𝐝𝐞𝐝 𝐛𝐲: ${adderName}\n` +
    `━━━━━━━━━━━━━━━━━━\n𝐄𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐬𝐭𝐚𝐲! 😊`;

  await sock.sendMessage(groupJid, {
    image: imageBuffer,
    mimetype: "image/png",
    caption,
    mentions: [participant]
  });
}

export default {
  config: {
    name: "welcome",
    event: "group-participants.update",
    version: "4.0.0",
    author: AUTHOR,
    description: "WhatsApp welcome card and bot join notification"
  },

  onStart: async ({ sock, data }) => {
    if (!data || data.action !== "add" || !data.id) return;
    const groupJid = data.id;
    if (!groupJid.endsWith("@g.us")) return;

    try {
      let groupName = "WhatsApp Group";
      let memberCount = 0;
      try {
        const metadata = await sock.groupMetadata(groupJid);
        groupName = metadata.subject || groupName;
        memberCount = metadata.participants?.length || 0;
      } catch (error) {
        console.error("[WELCOME] Metadata error:", error.message);
      }

      const botJid = sock.user?.id || "";
      const participants = data.participants || [];
      const botAdded = participants.some(participant => sameJid(participant, botJid));

      if (botAdded) await sendBotJoinNotice(sock, groupJid, groupName, memberCount);

      const groupSettings = await getGroup(groupJid);
      if (groupSettings?.welcome === false) return;

      if (SPECIAL_GROUP_JID && groupJid === SPECIAL_GROUP_JID) {
        for (const participant of participants) {
          if (sameJid(participant, botJid)) continue;
          await sock.sendMessage(groupJid, {
            text: SPECIAL_RULES.replace("USER", jidNumber(participant)),
            mentions: [participant]
          });
        }
        return;
      }

      for (const participant of participants) {
        if (sameJid(participant, botJid)) continue;
        try {
          await sendMemberWelcome({
            sock, groupJid, participant, groupName, memberCount, adderJid: data.author || ""
          });
        } catch (error) {
          console.error(`[WELCOME] Failed for ${participant}:`, error.message);
          try {
            await sock.sendMessage(groupJid, {
              text: `🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌸\n\nস্বাগতম @${jidNumber(participant)}!\n🏷️ Group: ${groupName}\n🌟 আমাদের গ্রুপে আপনাকে স্বাগতম।`,
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
