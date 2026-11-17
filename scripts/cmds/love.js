
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import axios from "axios";
import { AUTHOR } from "../../config.js";

const links = [
  "https://drive.google.com/uc?id=1xLc_9r1TYGVM0J33hJ61hmW3yXOBTcEo",
  "https://drive.google.com/uc?id=1xFVA97twVhvJJzmxhXjT9QukwWEDRO2a",
  "https://drive.google.com/uc?id=1xC8J23XORH4zHsXCDkfrgzmVBm1_-b5E",
  "https://drive.google.com/uc?id=1x5EX0grUJwEKzHyzeR63HnzC_UlDdJD6",
  "https://drive.google.com/uc?id=1xM82tBosefpCvaDokhufHoikub1Opupz",
  "https://drive.google.com/uc?id=1xhCqfx7pScogeGph4T4ITnRJFYcUNmJ8",
  "https://drive.google.com/uc?id=1xTgkjk__QRMOVQnkQsSIcEzGfRUwUDLY",
  "https://drive.google.com/uc?id=1xRsWDPe485xXPna9nWhj0TaW_Q9lVJDd",
  "https://drive.google.com/uc?id=1xC30T2eSDWZGr_O8699yxaMS-AZ_X5y8",
  "https://drive.google.com/uc?id=1xcoHMLkNU1naPET4bP2sEiHoXUF23w-R",
  "https://drive.google.com/uc?id=1xcN88lPjPoRJhdxCUesuTFFArtvbUNL2",
  "https://drive.google.com/uc?id=1xUee8t4ukXW_XD4K4pGV_I4VFccwdyqt",
  "https://drive.google.com/uc?id=1xgfepctwXjZ5Y9kxhD3HcTTaJcsWHi-x",
  "https://drive.google.com/uc?id=1xhymaD6J1patQzfass5-e4ewUDg8gnQ9",
  "https://drive.google.com/uc?id=1xCvCvUa2zVWLm3y1pAGFKrr-emyaFicK",
  "https://drive.google.com/uc?id=1x87CHgjwaOjANyN_06_JqB-YKaUQGU2b"
];

const captions = [
`===「𝐏𝐑𝐄𝐅𝐈𝐗-𝐄𝐕𝐄𝐍𝐓」===
--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖--
✢━━━━━━━━━━━━━━━✢
🎀 ♡-𝐋💞𝐕𝐄-𝐕𝐈𝐃💍-♡ 🎀
✢━━━━━━━━━━━━━━━✢
(✷‿𝐎𝐖𝐍𝐄𝐑:-‿𝐃𝐒-𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍✷)`
];

async function sendLoveVideo({ sock, jid, message, reply }) {
  try {
    if (!links.length) {
      return reply("⚠️ কোনো ভিডিও লিংক পাওয়া যায়নি!");
    }

    await reply("⏳ ভিডিও লোড হচ্ছে...\nএকটু অপেক্ষা করো।");

    const link = links[Math.floor(Math.random() * links.length)];
    const caption = captions[Math.floor(Math.random() * captions.length)];

    const response = await axios.get(link, {
      responseType: "arraybuffer",
      timeout: 60000,
      maxContentLength: 100 * 1024 * 1024,
      maxBodyLength: 100 * 1024 * 1024
    });

    const videoBuffer = Buffer.from(response.data);

    if (!videoBuffer.length) {
      throw new Error("Downloaded video is empty");
    }

    await sock.sendMessage(
      jid,
      {
        video: videoBuffer,
        mimetype: "video/mp4",
        caption
      },
      { quoted: message }
    );

  } catch (error) {
    console.error("[LOVE] Video Error:", error);

    await reply(
      "❌ ভিডিও পাঠাতে সমস্যা হয়েছে!\nGoogle Drive লিংকটি private, unavailable অথবা download limit-এ থাকতে পারে।"
    );
  }
}

export default {
  config: {
    name: "love",
    aliases: ["lovevideo", "lv"],
    version: "2.2.0",
    author: AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: "Love/Sad video sender 💔",
    longDescription: "Sends a random love/sad video with an emotional caption.",
    category: "media",
    guide: "{pn}"
  },

  onStart: async function ({ sock, jid, message, reply }) {
    return sendLoveVideo({ sock, jid, message, reply });
  }
};
