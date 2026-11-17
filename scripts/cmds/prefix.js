// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// Original designs, fonts and GIF URLs retained; adapted for Baileys.

import { AUTHOR, CONFIG, isBotAdmin } from "../../config.js";
import { getCommands } from "../../core/commandHandler.js";
import { getGroup, updateGroup } from "../../database/groups.js";
import { readData, writeData } from "../../database/index.js";

const mediaList = [
  "https://i.imgur.com/8pT5G8g.gif",
  "https://i.imgur.com/7iqtimo.gif"
];

function toBoldFont(text) {
  const map = {
    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
    a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
    0:"𝟎",1:"𝟏",2:"𝟐",3:"𝟑",4:"𝟒",5:"𝟓",6:"𝟔",7:"𝟕",8:"𝟖",9:"𝟗"
  };
  return String(text ?? "").split("").map(c => map[c] || c).join("");
}

async function sendPrefixInfo(context) {
  const { sock, jid, isGroup, reply } = context;
  const globalData = await readData("prefix", { prefix: CONFIG.PREFIX });
  const systemPrefix = globalData.prefix || CONFIG.PREFIX;
  const group = isGroup ? await getGroup(jid) : null;
  const groupPrefix = group?.prefix || systemPrefix;
  const now = new Date();
  const timeRaw = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: true
  }).format(now);
  const dateRaw = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric"
  }).format(now);
  const total = new Set([...getCommands().values()].map(c => c.config.name)).size;

  const design1 = `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
⚙️ 𝐏𝐑𝐄𝐅𝐈𝐗
╰─➤ ${toBoldFont(systemPrefix)}
💬 𝐆𝐑𝐎𝐔𝐏
╰─➤ ${toBoldFont(groupPrefix)}
» 🕐 𝐓𝐈𝐌𝐄  › ${toBoldFont(timeRaw)}
» 📆 𝐃𝐀𝐓𝐄  › ${toBoldFont(dateRaw)}
» 👑 𝐎𝐖𝐍𝐄𝐑 ›
» ⚛️ 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
» ⚡ 𝐂𝐌𝐃𝐒  › ${toBoldFont(total)}
» ⚛️ 𝐕𝐄𝐑   › 𝐕𝟐 • 𝐕𝟑 • 𝐕𝟓
» ✅ 𝐒𝐓𝐀𝐓𝐔𝐒 › 𝐀𝐂𝐓𝐈𝐕𝐄
───────────────
╭─ 🔗 𝐆𝐈𝐓𝐇𝐔𝐁 ─╮
╰➤ [ https://github.com/siyamxpro/siyamxpro.git ]
───────────────
🧚‍♀️𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

  const design2 = `❖ ─ [ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎 ] ─ ❖

⚡ 𝐏𝐑𝐄𝐅𝐈𝐗 : ➜ [ ${toBoldFont(systemPrefix)} ]
💬 𝐆𝐑𝐎𝐔𝐏 : ── ❖ ${toBoldFont(groupPrefix)} ❖──
⏰ 𝐓𝐈𝐌𝐄 : ${toBoldFont(timeRaw)}
📅 𝐃𝐀𝐓𝐄 : ${toBoldFont(dateRaw)}
👑 𝐎𝐖𝐍𝐄𝐑 :
⚛️ 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
📊 𝐓𝐎𝐓𝐀🇱 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 : ${toBoldFont(total)}
⚛️ 𝐕𝐄𝐑𝐒𝐈𝐎𝐍 : 𝐕𝟐 • 𝐕𝟑 • 𝐕𝟓
✅ 𝐒𝐓𝐀𝐓𝐔𝐒 : 𝐀𝐂𝐓𝐈𝐕𝐄
───────────────
╭─ 🔗 𝐆𝐈𝐓𝐇𝐔𝐁 ─╮
╰➤ [ https://github.com/siyamxpro/siyamxpro.git ]
───────────────
⚛️ 𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓𝐁𝐎𝐓`;

  const caption = Math.random() < 0.5 ? design1 : design2;
  const mediaUrl = mediaList[Math.floor(Math.random() * mediaList.length)];

  // WhatsApp GIF playback is MP4-based. Try Baileys GIF mode; fall back to the original GIF URL.
  try {
    const response = await fetch(mediaUrl, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`GIF HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await sock.sendMessage(jid, {
      video: buffer,
      gifPlayback: true,
      mimetype: "video/mp4",
      caption
    });
  } catch (error) {
    console.warn("[PREFIX] GIF playback fallback:", error.message);
    await reply(`${caption}\n\n🎞️ GIF: ${mediaUrl}`);
  }
}

export default {
  config: {
    name: "prefix",
    aliases: ["pre"],
    version: "3.4",
    author: AUTHOR,
    role: "USER",
    category: "SYSTEM",
    usage: "{pn} | {pn} <new_prefix> | {pn} reset | {pn} <new_prefix> -g"
  },

  onStart: async context => {
    const { args = [], reply, jid, isGroup, senderJid, permission } = context;
    const action = args[0];

    if (!action) return sendPrefixInfo(context);

    const globalMode = args[1] === "-g";
    if (globalMode && !isBotAdmin(senderJid)) {
      return reply("⛔ Global Prefix পরিবর্তন করার অনুমতি শুধু Bot Admin-এর আছে।");
    }

    if (action === "reset") {
      if (globalMode) {
        await writeData("prefix", { prefix: CONFIG.PREFIX });
        return reply(`✅ Global Prefix Reset হয়েছে: ${CONFIG.PREFIX}`);
      }
      if (isGroup) {
        await updateGroup(jid, { prefix: null });
        return reply(`✅ এই গ্রুপের Prefix Reset হয়েছে। এখন Global Prefix: ${(await readData("prefix", {prefix: CONFIG.PREFIX})).prefix || CONFIG.PREFIX}`);
      }
      await writeData("prefix", { prefix: CONFIG.PREFIX });
      return reply(`✅ Prefix Reset হয়েছে: ${CONFIG.PREFIX}`);
    }

    const nextPrefix = String(action);
    if (nextPrefix.length > 5 || /\s/.test(nextPrefix)) {
      return reply("❌ Prefix ১-৫ অক্ষরের হতে হবে এবং Space থাকা যাবে না।");
    }

    if (globalMode) {
      await writeData("prefix", { prefix: nextPrefix });
      return reply(`✅ 𝐆𝐋𝐎𝐁𝐀𝐋 𝐏𝐑𝐄𝐅𝐈𝐗 𝐂𝐇𝐀𝐍𝐆𝐄𝐃!\n🆕 ${nextPrefix}`);
    }

    if (!isGroup) return reply("❌ Group Prefix পরিবর্তন করতে গ্রুপে কমান্ডটি ব্যবহার করো।");
    await updateGroup(jid, { prefix: nextPrefix });
    return reply(`✅ 𝐆𝐑𝐎𝐔𝐏 𝐏𝐑𝐄𝐅𝐈𝐗 𝐂𝐇𝐀𝐍𝐆𝐄𝐃!\n🆕 ${nextPrefix}`);
  }
};
