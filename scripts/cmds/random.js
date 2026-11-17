
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { AUTHOR, CONFIG } from "../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cacheDir = path.join(__dirname, "..", "..", "cache");

const videoLinks = [
  "https://files.catbox.moe/wjdxmi.mp4",
  "https://files.catbox.moe/50c5xk.mp4",
  "https://files.catbox.moe/gnwsb0.mp4",
  "https://files.catbox.moe/xvnddb.mp4",
  "https://files.catbox.moe/ar6eq8.mp4",
  "https://files.catbox.moe/nu2sa2.mp4",
  "https://files.catbox.moe/ywr5qk.mp4",
  "https://files.catbox.moe/m1urbb.mp4",
  "https://files.catbox.moe/1dphq6.mp4",
  "https://files.catbox.moe/davog1.mp4",
  "https://files.catbox.moe/v5fd3j.mp4",
  "https://files.catbox.moe/59s710.mp4",
  "https://files.catbox.moe/uwyl06.mp4",
  "https://files.catbox.moe/qivkp6.mp4",
  "https://files.catbox.moe/9p5y43.mp4",
  "https://files.catbox.moe/183i71.mp4",
  "https://files.catbox.moe/yjryst.mp4",
  "https://files.catbox.moe/2mteak.mp4",
  "https://files.catbox.moe/c0iehe.mp4",
  "https://files.catbox.moe/arrdxy.mp4",
  "https://files.catbox.moe/yi59sk.mp4",
  "https://files.catbox.moe/3ubxm3.mp4",
  "https://files.catbox.moe/7f8wqk.mp4",
  "https://files.catbox.moe/pvw8bb.mp4",
  "https://files.catbox.moe/kobwni.mp4",
  "https://files.catbox.moe/l3fr5m.mp4",
  "https://files.catbox.moe/juu46e.mp4",
  "https://files.catbox.moe/1z7rbm.mp4",
  "https://files.catbox.moe/6k39ei.mp4",
  "https://files.catbox.moe/3cxmpr.mp4",
  "https://files.catbox.moe/1z7rbm.mp4",
  "https://files.catbox.moe/9a4u5v.mp4",
  "https://files.catbox.moe/31iuqn.mp4",
  "https://files.catbox.moe/mbdsqx.mp4",
  "https://files.catbox.moe/ejpekx.mp4",
  "https://files.catbox.moe/823nau.mp4",
  "https://files.catbox.moe/3g7cn7.mp4",
  "https://files.catbox.moe/76mp19.mp4",
  "https://files.catbox.moe/jj7hdr.mp4"
];

const validLinks = videoLinks.filter(link => link.trim());

function getRandomVideo() {
  return validLinks[Math.floor(Math.random() * validLinks.length)];
}

async function downloadVideo(url) {
  await fs.ensureDir(cacheDir);

  const fileName = `GOAT_V_${Date.now()}_${Math.floor(Math.random() * 9999)}.mp4`;
  const filePath = path.join(cacheDir, fileName);

  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 60000,
    maxContentLength: 100 * 1024 * 1024
  });

  await fs.writeFile(filePath, Buffer.from(response.data));

  return { filePath, fileName };
}

async function sendRandomVideo({ sock, jid, message, reply }) {
  let filePath;

  try {
    if (!validLinks.length) {
      return reply("⚠️ 𝗡𝗼 𝘃𝗶𝗱𝗲𝗼 𝗹𝗶𝗻𝗸𝘀 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗲 𝗹𝗶𝘀𝘁!");
    }

    const loading = await reply(
      "⏳ 𝗩𝗶𝗱𝗲𝗼 𝗶𝘀 𝗹𝗼𝗮𝗱𝗶𝗻𝗴...\n𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝗮 𝗺𝗼𝗺𝗲𝗻𝘁."
    );

    const { filePath: downloadedPath, fileName } =
      await downloadVideo(getRandomVideo());

    filePath = downloadedPath;

    const caption =
`🎥 𝗛𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝗥𝗮𝗻𝗱𝗼𝗺 𝗩𝗶𝗱𝗲𝗼!

🆔 𝗩𝗶𝗱𝗲𝗼 𝗡𝗮𝗺𝗲: ${fileName}
👤 𝗢𝘄𝗻𝗲𝗿: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍

⏭️ পরবর্তী ভিডিও পেতে লিখুন:
${CONFIG.PREFIX || "."}random`;

    await sock.sendMessage(
      jid,
      {
        video: await fs.readFile(filePath),
        mimetype: "video/mp4",
        fileName,
        caption
      },
      { quoted: message }
    );

    if (loading?.key) {
      await sock.sendMessage(jid, {
        delete: loading.key
      }).catch(() => {});
    }

  } catch (error) {
    console.error("[RANDOM] Error:", error);

    await reply(
      "❌ 𝗘𝗿𝗿𝗼𝗿: 𝗨𝗻𝗮𝗯𝗹𝗲 𝘁𝗼 𝘀𝗲𝗻𝗱 𝘃𝗶𝗱𝗲𝗼."
    );
  } finally {
    if (filePath) {
      await fs.remove(filePath).catch(() => {});
    }
  }
}

export default {
  config: {
    name: "random",
    aliases: ["rnd", "randomvideo"],
    version: "2.1.0",
    author: AUTHOR,
    countDown: 15,
    role: 0,
    shortDescription: "Sends a random video from the list",
    longDescription: "Sends a random video from the configured video link list.",
    category: "media",
    guide: "{pn}"
  },

  onStart: async function ({ sock, jid, message, reply }) {
    return sendRandomVideo({ sock, jid, message, reply });
  }
};
