
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import axios from "axios";
import { AUTHOR } from "../../config.js";

const links = [
  "https://drive.google.com/uc?id=1Zg6YCrfLNFVPuIarV3ZBvyg9NW9vKf-i",
  "https://drive.google.com/uc?id=1Tu7vjhlkUls3SKSTl-pGK3y69NYgeGMe",
  "https://drive.google.com/uc?id=1vHhwiHHDRJpflMGCU0Alg7A5ARkugLya",
  "https://drive.google.com/uc?id=1KrHanrUqkqr0kFjFh1abl72xlmZ0_18a",
  "https://drive.google.com/uc?id=1rs6cbx8oOYg2Zgi_0UZHfbDhEz8LjFlU",
  "https://drive.google.com/uc?id=1thJh4_fG8DYdgKiOhsy8Jkp98O0m-23b",
  "https://drive.google.com/uc?id=1T5x_hAEu5yozou0HeNrCHC6GS3XbgTSx",
  "https://drive.google.com/uc?id=1CRvedhuz9z2JWLY6LH2dNgtt7cwuBBsG",
  "https://drive.google.com/uc?id=1RbPFrHj4y7eno8OsAuYElOfdOsJ75eZp",
  "https://drive.google.com/uc?id=1mY0B0yGi90h0K1GvxVdZ7eLkj-Q-W2Eq",
  "https://drive.google.com/uc?id=1xgh5EePrQq62zeDRu2YAkJTrAXSCXpOp",
  "https://drive.google.com/uc?id=1-aZjX6vnC1HDn25jBoexmyLBlm6bLwli",
  "https://drive.google.com/uc?id=1znMcAJbcDnS0oDG6LCUH8PN0gZOJxhRC",
  "https://drive.google.com/uc?id=1teEOVYZwvGuz75_Is_ZEEvZwroB1IZW8",
  "https://drive.google.com/uc?id=10gQjKcAL8MkXOqi8vLYqPYiFg0_Qh-rR",
  "https://drive.google.com/uc?id=1b0xOpxhPq0xZO7QDpU4BZ-OnRKYPMdLD",
  "https://drive.google.com/uc?id=1-KLse2-7YKacnPGL7zHH5_KOHQUbVUt0"
];

const captionText = `===「𝐏𝐑𝐄𝐅𝐈𝐗-𝐄𝐕𝐄𝐍𝐓」===
--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖--
✢━━━━━━━━━━━━━━━✢
🤡 ♡-𝐅𝐔𝐍𝐍𝐘-𝐕𝐈𝐃𝐄𝐎-♡ 🤡
✢━━━━━━━━━━━━━━━✢
(✷‿𝐎𝐖𝐍𝐄𝐑:-𝐃𝐒-𝐒𝐈𝐘𝐀𝐌‿✷)`;

const downloadVideo = async (url) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 60000,
    maxContentLength: 100 * 1024 * 1024,
    maxBodyLength: 100 * 1024 * 1024
  });

  const buffer = Buffer.from(response.data);

  if (!buffer.length) {
    throw new Error("Downloaded video is empty");
  }

  return buffer;
};

async function sendFunnyVideo({ sock, jid, message, reply }) {
  try {
    if (!links.length) {
      return reply("⚠️ কোনো ভিডিও লিংক পাওয়া যায়নি!");
    }

    await reply("🔄 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 𝗙𝗨𝗡𝗡𝗬 𝗩𝗜𝗗𝗘𝗢...");

    const link = links[Math.floor(Math.random() * links.length)];
    const videoBuffer = await downloadVideo(link);

    await sock.sendMessage(
      jid,
      {
        video: videoBuffer,
        mimetype: "video/mp4",
        caption: captionText
      },
      { quoted: message }
    );

  } catch (error) {
    console.error("[FUNNY] Video Error:", error);

    await reply("❌ ভিডিও পাঠাতে সমস্যা হয়েছে! ভিডিও লিংকটি পরীক্ষা করো।");
  }
}

export default {
  config: {
    name: "funny",
    aliases: ["fun", "funvideo"],
    version: "2.0.0",
    author: AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: "Funny video sender 😃",
    longDescription: "Sends a random funny video with a caption.",
    category: "media",
    guide: "{pn}"
  },

  onStart: async function ({ sock, jid, message, reply }) {
    return sendFunnyVideo({ sock, jid, message, reply });
  }
};
