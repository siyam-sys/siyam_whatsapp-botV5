
import axios from "axios";
import { AUTHOR } from "../../config.js";

const links = [
  "https://drive.google.com/uc?id=14emH_6vF3fuJe2vmeC52e575TppboHne",
  "https://drive.google.com/uc?id=15APJbSuGLY7zCiZsAgU7HjCJeinYDX9K",
  "https://drive.google.com/uc?id=15ImMIXM_mqPM8hXpQNPLTGCrm9sh0RPS",
  "https://drive.google.com/uc?id=14qUnMm3J3cUqImDDy4ehRjDiv_NeRpMo",
  "https://drive.google.com/uc?id=15ZqanDuEYrC-lHSsiIYAjWagr1h8yZpP",
  "https://drive.google.com/uc?id=155rlKywUHP3xzgJkQ1ztxXpKnDxXtXlb",
  "https://drive.google.com/uc?id=156MaTKck-_ureBfj7NI-iU7_rGut-ssD",
  "https://drive.google.com/uc?id=15l4gxljfoe9-WvQKzffjambLC5Tt1YNd",
  "https://drive.google.com/uc?id=15fauLjjElJ0loxajhUvDeaKTqW4YdskK",
  "https://drive.google.com/uc?id=16IBAHr7AlKM1RR4hiTBuvAn5x27ed6j4",
  "https://drive.google.com/uc?id=15amvNN6WLIKwg17ufgFhs7EqI0EXNxy5",
  "https://drive.google.com/uc?id=15OS5gFi2QGZm5TTStIn6iD3YRUNHw1Zm",
  "https://drive.google.com/uc?id=168qMjWaEyObyBgJrilyTb4vOcvgynQAD",
  "https://drive.google.com/uc?id=15FFHINVpAbr4ykjkhk1_vQ5uDQakTcpy",
  "https://drive.google.com/uc?id=14j501R3TheTH3YLInLZlLTU-oXVvjegw",
  "https://drive.google.com/uc?id=15UmCBW1ddt6Kpt9xytqPpXiJip-05bDG",
  "https://drive.google.com/uc?id=14e0lCDG6vwzGi8apiDcm38Wov911501y",
  "https://drive.google.com/uc?id=15Cbl-YGajKcV0QMp6bDtRT4dI-K6lWR0",
  "https://drive.google.com/uc?id=15hJ9St2amhdLnowAvuDn0BicgZ5Aw0rW",
  "https://drive.google.com/uc?id=15QIjrXblGNjf5b3J6dRQ4XMSV-_j7soB",
  "https://drive.google.com/uc?id=15tgfSnX-ICfO8V5T6vXbb_AwYkfl_EYX"
];

const captions = [
  `===「𝐏𝐑𝐄𝐅𝐈𝐗-𝐄𝐕𝐄𝐍𝐓」===
--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖--
✢━━━━━━━━━━━━━━━✢
🕋 ♡-𝐈𝐒𝐋𝐀𝐌𝐈𝐂-𝐕𝐈𝐃𝐄𝐎-♡ 🕋
✢━━━━━━━━━━━━━━━✢
(✷‿𝐎𝐖𝐍𝐄𝐑:-‿𝐃-𝐒 𝐒𝐈𝐘𝐀𝐌‿✷)`
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function downloadVideo(url) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 60000,
    maxContentLength: 100 * 1024 * 1024,
    maxBodyLength: 100 * 1024 * 1024
  });

  const buffer = Buffer.from(response.data);

  if (!buffer.length) {
    throw new Error("Downloaded video is empty.");
  }

  // Google Drive কখনো ভিডিওর বদলে HTML পাঠাতে পারে।
  const contentType = response.headers["content-type"] || "";
  if (contentType.includes("text/html")) {
    throw new Error("Google Drive returned an HTML page instead of video.");
  }

  return buffer;
}

export default {
  config: {
    name: "islamic",
    aliases: ["islam", "islamicvideo"],
    version: "2.3.0",
    author: AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: "Islamic video sender 🕋",
    longDescription: "Sends a random Islamic video.",
    category: "media",
    guide: "{pn}"
  },

  onStart: async function ({ sock, message, jid, reply }) {
    let loading;

    try {
      loading = await reply("⏳ ইসলামিক ভিডিও লোড হচ্ছে, দয়া করে অপেক্ষা করুন...");

      const link = links[Math.floor(Math.random() * links.length)];
      const caption = captions[Math.floor(Math.random() * captions.length)];

      const videoBuffer = await downloadVideo(link);

      await sock.sendMessage(
        jid,
        {
          video: videoBuffer,
          mimetype: "video/mp4",
          caption: `${caption}\n\n⏭️ পরবর্তী ভিডিও পেতে .islamic লিখুন।`
        },
        { quoted: message }
      );

      if (loading?.key) {
        await sock.sendMessage(jid, {
          delete: loading.key
        }).catch(() => {});
      }
    } catch (error) {
      console.error("[ISLAMIC COMMAND]", error);

      if (loading?.key) {
        await sock.sendMessage(jid, {
          delete: loading.key
        }).catch(() => {});
      }

      await reply("❌ ইসলামিক ভিডিও পাঠাতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
    }
  }
};

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
