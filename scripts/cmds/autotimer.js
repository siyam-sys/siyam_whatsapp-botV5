
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import fs from "fs-extra";
import path from "path";
import axios from "axios";
import moment from "moment-timezone";
import { fileURLToPath } from "url";
import { AUTHOR, CONFIG } from "../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cacheDir = path.join(__dirname, "..", "..", "cache");
const statusFile = path.join(__dirname, "..", "..", "autotimer_status.json");

const timerData = {
  "12:00 AM": { text: "🌌 এখন রাত ১২টা বাজে❥︎নতুন দিন শুরু হলো ✨", url: "https://files.catbox.moe/2ii8c7.mp4" },
  "01:00 AM": { text: "🌙 এখন রাত ১টা বাজে❥︎গভীর রাত, ঘুমাও সবাই 🤫", url: "https://files.catbox.moe/ah0s9r.mp4" },
  "02:00 AM": { text: "🖤 এখন রাত ২টা বাজে❥︎কিছু নীরব স্মৃতি ও একাকীত্ব 🥀", url: "https://files.catbox.moe/ydwkrm.mp4" },
  "03:00 AM": { text: "💤 এখন রাত ৩টা বাজে❥︎মন শুধু তোমাকেই খোঁজে 🥺", url: "https://files.catbox.moe/111n24.mp4" },
  "04:00 AM": { text: "🕌 এখন ভোর ৪টা বাজে❥︎তাহাজ্জুদ/ফজরের প্রস্তুতি নাও 🤲", url: "https://files.catbox.moe/ebyeyi.mp4" },
  "05:00 AM": { text: "🌅 এখন ভোর ৫টা বাজে❥︎শুভ সকাল, ভালো কাটুক দিনটি ☕", url: "https://files.catbox.moe/olpzpk.mp4" },
  "06:00 AM": { text: "🌞 এখন সকাল ৬টা বাজে❥︎ঘুম থেকে উঠো সবাই ☕", url: "https://files.catbox.moe/3y330y.mp4" },
  "07:00 AM": { text: "🍞 এখন সকাল ৭টা বাজে❥︎ব্রেকফাস্ট করে নাও", url: "https://files.catbox.moe/j4fhyp.mp4" },
  "08:00 AM": { text: "✨ এখন সকাল ৮টা বাজে❥︎কাজ শুরু করো মন দিয়ে", url: "https://files.catbox.moe/gc2ard.mp4" },
  "09:00 AM": { text: "🕘 এখন সকাল ৯টা বাজে❥︎চল কাজে মন দিই", url: "https://files.catbox.moe/44oya3.mp4" },
  "10:00 AM": { text: "☀️ এখন সকাল ১০টা বাজে❥︎তোমাদের মিস করছি", url: "https://files.catbox.moe/ffvnm1.mp4" },
  "11:00 AM": { text: "😌 এখন সকাল ১১টা বাজে❥︎কাজ চালিয়ে যাও", url: "https://files.catbox.moe/c5ja93.mp4" },
  "12:00 PM": { text: "❤️ এখন দুপুর ১২টা বাজে❥︎ভালোবাসা জানাও সবাইকে", url: "https://files.catbox.moe/56bgjp.mp4" },
  "01:00 PM": { text: "🤲 এখন দুপুর ১টা বাজে❥︎জোহরের নামাজ পড়ে নাও", url: "https://files.catbox.moe/2l5loh.mp4" },
  "02:00 PM": { text: "🍛 এখন দুপুর ২টা বাজে❥︎দুপুরের খাবার খেয়েছো তো", url: "https://files.catbox.moe/0j8bwh.mp4" },
  "03:00 PM": { text: "☀️ এখন বিকাল ৩টা বাজে❥︎কাজে ফোকাস করো", url: "https://files.catbox.moe/4hjg4f.mp4" },
  "04:00 PM": { text: "🥀 এখন বিকাল ৪টা বাজে❥︎আসরের নামাজ পড়ে নাও", url: "https://files.catbox.moe/l5bfws.mp4" },
  "05:00 PM": { text: "🌆 এখন বিকাল ৫টা বাজে❥︎একটু বিশ্রাম নাও", url: "https://files.catbox.moe/7nvnsi.mp4" },
  "06:00 PM": { text: "🌇 এখন সন্ধ্যা ৬টা বাজে❥︎পরিবারকে সময় দাও 😍", url: "https://files.catbox.moe/j7gndp.mp4" },
  "07:00 PM": { text: "🌃 এখন সন্ধ্যা ৭টা বাজে❥︎এশার নামাজ পড়ো ❤️", url: "https://files.catbox.moe/9tfka4.mp4" },
  "08:00 PM": { text: "🧖 এখন রাত ৮টা বাজে❥︎আজকের কাজ শেষ করো", url: "https://files.catbox.moe/6dyzum.mp4" },
  "09:00 PM": { text: "🌙 এখন রাত ৯টা বাজে❥︎ঘুমের প্রস্তুতি নাও 😴", url: "https://files.catbox.moe/hgf9vq.mp4" },
  "10:00 PM": { text: "💤 এখন রাত ১০টা বাজে❥︎ঘুমাতে যাও, স্বপ্নে দেখা হবে", url: "https://files.catbox.moe/3e5pct.mp4" },
  "11:00 PM": { text: "🌌 এখন রাত ১১টা বাজে❥︎ভালোবাসা রইলো 🥰", url: "https://files.catbox.moe/uak967.mp4" }
};

const WELCOME_VIDEO = "https://files.catbox.moe/2ii8c7.mp4";
const OWNER_NUMBER = String(CONFIG.OWNER_NUMBER || "").replace(/\D/g, "");

let timerStarted = false;
let timerInterval = null;
let lastSentTime = "";

function readStatus() {
  try {
    if (!fs.existsSync(statusFile)) {
      return { activeThreads: [], knownThreads: [] };
    }

    const data = fs.readJsonSync(statusFile);
    const activeThreads = Array.isArray(data.activeThreads)
      ? data.activeThreads.map(String)
      : [];
    const knownThreads = Array.isArray(data.knownThreads)
      ? data.knownThreads.map(String)
      : [...activeThreads];

    return {
      activeThreads: [...new Set(activeThreads)],
      knownThreads: [...new Set([...knownThreads, ...activeThreads])]
    };
  } catch (error) {
    console.error("[AUTOTIMER] Status read error:", error.message);
    return { activeThreads: [], knownThreads: [] };
  }
}

function saveStatus(data) {
  fs.ensureDirSync(path.dirname(statusFile));
  fs.writeJsonSync(statusFile, data, { spaces: 2 });
}

function isGroupJid(jid) {
  return typeof jid === "string" && jid.endsWith("@g.us");
}

function getGroupName(metadata) {
  return metadata?.subject || "WhatsApp Group";
}

function createWelcomeMessage() {
  const currentTime = moment().tz("Asia/Dhaka");

  return `╭───────────────⭓
│ 🪯 𝗦𝗜𝗬𝗔𝗠 𝗔𝗨𝗧𝗢 𝗧𝗜𝗠𝗘𝗥
├───────────────⭓
│ 🕒 𝗧𝗜𝗠𝗘 : ${currentTime.format("hh:mm A")}
│ 📅 𝗗𝗔𝗧𝗘 : ${currentTime.format("DD-MM-YYYY")}
├───────────────⭓
│ 🎉 এই গ্রুপে অটো টাইম চালু হয়েছে!
│ ⏰ এখন থেকে প্রতি ঘণ্টায়
│ 🎥 ভিডিওসহ অটো মেসেজ পাঠানো হবে।
├───────────────⭓
│ ✅ 𝗦𝗧𝗔𝗧𝗨𝗦 : 𝗔𝗖𝗧𝗜𝗩𝗘
│ 👑 𝗢𝗪𝗡𝗘𝗥 : ${AUTHOR}
╰───────────────⭓`;
}

async function sendVideo(sock, jid, url, caption) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 30000,
    maxContentLength: 50 * 1024 * 1024
  });

  const buffer = Buffer.from(response.data);

  return sock.sendMessage(jid, {
    video: buffer,
    mimetype: "video/mp4",
    caption
  });
}

async function sendWelcome(sock, chatId) {
  try {
    await sendVideo(sock, chatId, WELCOME_VIDEO, createWelcomeMessage());
    console.log("[AUTOTIMER] Welcome sent:", chatId);
  } catch (error) {
    console.error("[AUTOTIMER] Welcome error:", chatId, error.message);

    try {
      await sock.sendMessage(chatId, {
        text: createWelcomeMessage()
      });
    } catch {}
  }
}

async function activateGroup(sock, chatId) {
  if (!isGroupJid(chatId)) return;

  const status = readStatus();
  const isNew = !status.knownThreads.includes(chatId);
  const isInactive = !status.activeThreads.includes(chatId);

  if (!isNew && !isInactive) return;

  if (!status.knownThreads.includes(chatId)) {
    status.knownThreads.push(chatId);
  }

  if (!status.activeThreads.includes(chatId)) {
    status.activeThreads.push(chatId);
  }

  saveStatus(status);

  await sendWelcome(sock, chatId);
}

async function sendHourlyMessages(sock) {
  const currentTime = moment().tz("Asia/Dhaka");
  const minute = currentTime.format("mm");
  const timeKey = currentTime.format("hh:00 A");

  if (minute !== "00" || !timerData[timeKey]) return;

  const dateKey = currentTime.format("YYYY-MM-DD");
  const uniqueTime = `${dateKey} ${timeKey}`;

  if (lastSentTime === uniqueTime) return;
  lastSentTime = uniqueTime;

  const status = readStatus();
  if (!status.activeThreads.length) return;

  const todayDate = currentTime.format("DD-MM-YYYY");
  const currentHourData = timerData[timeKey];

  const caption = `╭───────────────⭓
│ ⏰ 𝗔𝗨𝗧𝗢 𝗧𝗜𝗠𝗘 𝗡𝗢𝗧𝗘
├───────────────⭓
│ 🕒 𝗧𝗜𝗠𝗘 : ${timeKey}
│ 📅 𝗗𝗔𝗧𝗘 : ${todayDate}
├───────────────⭓
│ ${currentHourData.text}
├───────────────⭓
│ 👑 𝆠፝${AUTHOR} 👑
╰───────────────⭓`;

  for (const chatId of status.activeThreads) {
    try {
      await sendVideo(sock, chatId, currentHourData.url, caption);
      console.log("[AUTOTIMER] Sent:", timeKey, chatId);
    } catch (error) {
      console.error("[AUTOTIMER] Send error:", chatId, error.message);
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

function startTimer(sock) {
  if (timerStarted) return;

  timerStarted = true;

  const status = readStatus();

  for (const chatId of status.activeThreads) {
    sendWelcome(sock, chatId).catch(error => {
      console.error("[AUTOTIMER] Startup welcome error:", error.message);
    });
  }

  sendHourlyMessages(sock).catch(error => {
    console.error("[AUTOTIMER] Initial timer error:", error.message);
  });

  timerInterval = setInterval(() => {
    sendHourlyMessages(sock).catch(error => {
      console.error("[AUTOTIMER] Timer error:", error.message);
    });
  }, 15000);

  console.log("[AUTOTIMER] Bangladesh timer started.");
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timerStarted = false;
}

function getCommandContext(context) {
  const jid = context.jid || context.message?.key?.remoteJid;
  const message = context.message;
  const senderJid = context.senderJid;
  const reply = context.reply;

  return { jid, message, senderJid, reply };
}

export default {
  config: {
    name: "autotimer",
    aliases: ["timer", "autotime"],
    version: "12.0",
    author: AUTHOR,
    role: 1,
    category: "AutoTime",
    shortDescription: "⏰ ২৪ ঘণ্টায় ২৪টি ভিডিও ও টেক্সট পাঠাবে",
    longDescription: "বাংলাদেশ সময় অনুযায়ী প্রতি ঘণ্টায় নির্দিষ্ট গ্রুপে অটো ভিডিও ও মেসেজ পাঠাবে।",
    guide: "{pn} on/off"
  },

  onAnyEvent: async function ({ sock }) {
    startTimer(sock);
  },

  onStart: async function (context) {
    const { jid, message, reply } = getCommandContext(context);

    if (!isGroupJid(jid)) {
      return reply("⚠️ AutoTimer শুধুমাত্র গ্রুপে ব্যবহার করা যাবে।");
    }

    startTimer(context.sock);

    const args = Array.isArray(context.args) ? context.args : [];
    const action = String(args[0] || "").toLowerCase();

    if (!action) {
      return reply(
        `👑 ${AUTHOR} 👑
━━━━━━━━━━━━━━
⚙️ 𝗨𝗦𝗔𝗚𝗘 𝗚𝗨𝗜𝗗𝗘
${CONFIG.PREFIX || "."}autotimer on  -> 📽️ চালু করতে
${CONFIG.PREFIX || "."}autotimer off -> 🫶 বন্ধ করতে
━━━━━━━━━━━━━━
⏰ বাংলাদেশ সময় অনুযায়ী প্রতি ঘণ্টায়
🎥 ভিডিওসহ অটো মেসেজ যাবে।`
      );
    }

    const status = readStatus();

    if (action === "on") {
      if (!status.knownThreads.includes(jid)) {
        status.knownThreads.push(jid);
      }

      if (status.activeThreads.includes(jid)) {
        saveStatus(status);
        return reply("» ✅ AutoTimer ইতিমধ্যে ON আছে এই গ্রুপে 🟢");
      }

      status.activeThreads.push(jid);
      saveStatus(status);

      await sendWelcome(context.sock, jid);

      return reply(
        `╭━━━━━━━━━━━━━━━━━━╮
│ 🪯 𝐀𝐔𝐓𝐎 𝐓𝐈𝐌𝐄𝐑 𝐎𝐍 ✅
╰━━━━━━━━━━━━━━━━━━╯

⏰ এখন থেকে এই গ্রুপে প্রতি ঘণ্টায়
🎥 অটো ভিডিও ও টাইম মেসেজ যাবে।

👑 𝐎𝐖𝐍𝐄𝐑: ${AUTHOR}`
      );
    }

    if (action === "off") {
      if (!status.activeThreads.includes(jid)) {
        return reply("» 🛑 AutoTimer আগেই OFF আছে এই গ্রুপে 📴");
      }

      status.activeThreads = status.activeThreads.filter(id => id !== jid);
      saveStatus(status);

      return reply("» 📴 𝗔𝗨𝗧𝗢𝗧𝗜𝗠𝗘𝗥 𝗢𝗙𝗙 ⚙️\n» 🔕 এখন আর অটো ভিডিও যাবে না 🚫");
    }

    return reply(
      `⚠️ সঠিক কমান্ড ব্যবহার করো:\n${CONFIG.PREFIX || "."}autotimer on অথবা ${CONFIG.PREFIX || "."}autotimer off`
    );
  }
};
