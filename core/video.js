
import axios from "axios";
import { AUTHOR } from "../../config.js";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

async function searchVideo(query) {
  const apis = [
    `https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`,
    `https://yt-api-imran.vercel.app/api/search?query=${encodeURIComponent(query)}`
  ];

  for (const url of apis) {
    try {
      const res = await axios.get(url, { timeout: 20000 });
      let video = null;

      if (res.data?.[0]) {
        video = res.data[0];
      } else if (res.data?.results?.[0]) {
        video = res.data.results[0];
      } else if (res.data?.items?.[0]) {
        const item = res.data.items[0];
        video = {
          title: item.snippet?.title,
          url: `https://www.youtube.com/watch?v=${item.id?.videoId}`
        };
      }

      if (video?.url) return video;
    } catch (error) {
      continue;
    }
  }

  return null;
}

export default {
  config: {
    name: "video",
    aliases: ["ytvideo"],
    version: "2.2.3",
    author: AUTHOR,
    role: 0,
    category: "media",
    description: "Search and download YouTube videos",
    usage: "video <video name>"
  },

  onStart: async function ({ sock, message, jid, args, reply }) {
    const query = args.join(" ").trim();

    if (!query) {
      return reply(
        "❌ Please provide a video name.\n" +
        "📌 Example: video Let Me Love You"
      );
    }

    let loadingMsg;

    try {
      loadingMsg = await reply(
        `🔍 Searching YouTube\n` +
        `━━━━━━━━━━━━━━━\n` +
        `📌 Query: ${query}\n` +
        `⏳ Please wait...`
      );

      const video = await searchVideo(query);

      if (!video?.url) {
        throw new Error("No video results found.");
      }

      await reply(
        `🎬 Video found\n` +
        `━━━━━━━━━━━━━━━\n` +
        `📖 Title: ${video.title || "Unknown"}\n` +
        `⬇️ Downloading...`
      );

      const dlRes = await axios.get(
        `https://yt-api-imran.vercel.app/api?url=${encodeURIComponent(video.url)}`,
        { timeout: 30000 }
      );

      const downloadUrl = dlRes.data?.downloadUrl;

      if (!downloadUrl) {
        throw new Error("Download link not available.");
      }

      const fileRes = await axios.get(downloadUrl, {
        responseType: "arraybuffer",
        timeout: 60000,
        maxContentLength: 100 * 1024 * 1024,
        maxBodyLength: 100 * 1024 * 1024
      });

      const buffer = Buffer.from(fileRes.data);

      if (!buffer.length) {
        throw new Error("Downloaded video is empty.");
      }

      const caption =
        `━━━━━━━━━━━━━━━━━━\n` +
        `🎬 VIDEO READY\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📖 Title: ${video.title || "Unknown"}\n` +
        `⏱ Duration: ${video.time || "N/A"}\n` +
        `🖌️ POWER BY: 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n` +
        `━━━━━━━━━━━━━━━━━━`;

      await sock.sendMessage(
        jid,
        {
          video: buffer,
          mimetype: "video/mp4",
          fileName: "video.mp4",
          caption
        },
        { quoted: message }
      );

    } catch (error) {
      await reply(
        `❌ Failed\n` +
        `━━━━━━━━━━━━━━━\n` +
        `${error.message || "An unexpected error occurred."}`
      );
    } finally {
      if (loadingMsg?.key) {
        try {
          await sock.sendMessage(jid, {
            delete: loadingMsg.key
          });
        } catch (error) {
          // Ignore message deletion errors
        }
      }
    }
  }
};
