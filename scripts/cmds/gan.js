// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// Original Catbox media list retained and sent with Baileys media payloads.

const songLinks = [
  "https://files.catbox.moe/jx9cpq.mp4",
  "https://files.catbox.moe/jzg3j7.mp4",
  "https://files.catbox.moe/m4nggm.mp4",
  "https://files.catbox.moe/dbxfju.mp4",
  "https://files.catbox.moe/xx6d7i.mp4",
  "https://files.catbox.moe/0gncxf.mp4",
  "https://files.catbox.moe/gcm88s.mp4",
  "https://files.catbox.moe/yz23lp.mp4",
  "https://files.catbox.moe/etsdn9.mp3",
  "https://files.catbox.moe/ayepdz.mp3",
  "https://files.catbox.moe/oaecnx.mp3",
  "https://files.catbox.moe/xtpf61.mp3",
  "https://files.catbox.moe/12grz0.mp3",
  "https://files.catbox.moe/aaqddo.mp3",
  "https://files.catbox.moe/k3acvx.mp3",
  "https://files.catbox.moe/nry1qv.mp3",
  "https://files.catbox.moe/23e8u1.mp3",
  "https://files.catbox.moe/y8dzik.mp3",
  "https://files.catbox.moe/z9d2e6.mp3",
  "https://files.catbox.moe/0xscc8.mp3",
  "https://files.catbox.moe/q4m2ad.mp3",
  "https://files.catbox.moe/y8bg4r.mp3",
  "https://files.catbox.moe/q61co1.mp3",
  "https://files.catbox.moe/euq7fo.mp3",
  "https://files.catbox.moe/x5f56o.mp3",
  "https://files.catbox.moe/avlqok.mp3",
  "https://files.catbox.moe/v0twt3.mp3",
  "https://files.catbox.moe/qmpvpt.mp3"
];

let lastPlayed = -1;

export default {
  config: {
    name: "gan",
    version: "2.0.0",
    role: "USER",
    author: "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦",
    shortDescription: "Play a random song",
    longDescription: "Sends a random MP3 audio or MP4 music video from the original media list.",
    category: "MEDIA",
    usage: "{pn}"
  },

  onStart: async ({ sock, jid, reply }) => {
    let index = Math.floor(Math.random() * songLinks.length);
    if (songLinks.length > 1 && index === lastPlayed) index = (index + 1) % songLinks.length;
    lastPlayed = index;

    const url = songLinks[index];
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!buffer.length || buffer.length > 64 * 1024 * 1024) throw new Error("Invalid media size");

      if (url.toLowerCase().endsWith(".mp3")) {
        await sock.sendMessage(jid, {
          audio: buffer,
          mimetype: "audio/mpeg",
          ptt: false
        });
      } else {
        await sock.sendMessage(jid, {
          video: buffer,
          mimetype: "video/mp4",
          caption: "🎶 Hᴇʀᴇ's ʏᴏᴜʀ sᴏɴɢ 🎧"
        });
      }
    } catch (error) {
      console.error("[GAN]", error);
      await reply("⚠️ গানটি ডাউনলোড বা পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করো।");
    }
  }
};
