// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WhatsApp Baileys adaptation of the original Messenger voice command.

const videoData = [
  {
    caption: `জীবনটা সহজ না, কিন্তু সুন্দর 😊
কষ্ট থাকলেও হাসতে শিখো 💫
নিজের উপর বিশ্বাস রাখো 💪`,
    url: "https://files.catbox.moe/bs84st.mp4"
  },
  {
    caption: `সবাই পাশে থাকবে না 😌
কিন্তু নিজে নিজেকে কখনো ছেড়ে দিও না 💯
নিজের মূল্য বুঝতে শিখো 🔥`,
    url: "https://files.catbox.moe/hgo8gp.mp4"
  },
  {
    caption: `স্বপ্ন দেখতে ভয় পেয়ো না 💭
আজ ছোট হলেও কাল বড় হবে 🚀
ধৈর্য ধরো, সময় আসবে ⏳`,
    url: "https://files.catbox.moe/23zj4q.mp4"
  },
  {
    caption: `মন খারাপ হলেও চুপ থেকো না 😔
নিজের যত্ন নাও 🙂
একদিন সবকিছু সহজ লাগবে 🌸`,
    url: "https://files.catbox.moe/gogfic.mp4"
  },
  {
    caption: `নিজের মতো থাকো 😎
কারো জন্য নিজের পরিচয় বদলাতে যেও না ❌`,
    url: "https://files.catbox.moe/9uvit1.mp4"
  },
  {
    caption: `সময় অনেক কিছু শেখায় ⏳
মানুষ চিনতে শেখায় 😶
ভুল থেকে শিক্ষা নাও 📖`,
    url: "https://files.catbox.moe/l15d8y.mp4"
  },
  {
    caption: `আগে নিজেকে ভালোবাসতে শেখো ❤️
নিজের যত্ন নাও 💫
নিজের ভালো থাকাটাও জরুরি 😊🌸`,
    url: "https://files.catbox.moe/22enjn.mp4"
  },
  {
    caption: `ছোট ছোট মুহূর্ত উপভোগ করো 📸
এগুলোই একদিন সুন্দর স্মৃতি হবে 💖
হাসো, শেখো, এগিয়ে চলো 😊✨`,
    url: "https://files.catbox.moe/gitfya.mp4"
  },
  {
    caption: `জীবনে বাধা আসবেই ⚡
ধৈর্য ধরে চেষ্টা চালিয়ে যাও 💪🔥`,
    url: "https://files.catbox.moe/src6qb.mp4"
  },
  {
    caption: `চুপ থাকা সবসময় দুর্বলতা নয় 🤫
কখনো এটা নিজের শান্তি 💯
সব কথার উত্তর দিতে হয় না 😌`,
    url: "https://files.catbox.moe/9iqdo0.mp4"
  }
];

let lastIndex = -1;

export default {
  config: {
    name: "voice",
    aliases: ["fk"],
    version: "2.0.0",
    author: "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦",
    role: "USER",
    shortDescription: "Random Bangla caption video",
    longDescription: "Sends a random video with a Bangla motivational caption.",
    category: "FUN",
    usage: "{pn}"
  },

  onStart: async ({ sock, jid, message, reply }) => {
    let index = Math.floor(Math.random() * videoData.length);
    if (videoData.length > 1 && index === lastIndex) {
      index = (index + 1) % videoData.length;
    }
    lastIndex = index;

    const item = videoData[index];
    const footer = `
✢━━━━━━━━━━━━━━━✢
--❖(✷‿𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓‿✷)❖--
✢━━━━━━━━━━━━━━━✢
[সিয়াম বসের ফ্রেন্ড ফারহানের ভয়েজ]
✢━━━━━━━━━━━━━━━✢
(✷‿𝐎𝐖𝐍𝐄𝐑:-𝐒𝐈𝐘𝐀𝐌‿✷)`;

    try {
      await reply("⚡ 𝗩𝗜𝗗𝗘𝗢 𝗟𝗢𝗔𝗗𝗜𝗡𝗚... একটু অপেক্ষা করো।");

      const response = await fetch(item.url, {
        signal: AbortSignal.timeout(30000),
        headers: { "user-agent": "Mozilla/5.0" }
      });

      if (!response.ok) {
        throw new Error(`ভিডিও সার্ভার HTTP ${response.status} দিয়েছে`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType && !contentType.includes("video") &&
          !contentType.includes("octet-stream")) {
        throw new Error("লিংক থেকে ভিডিও ফাইল পাওয়া যায়নি");
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (!buffer.length || buffer.length > 64 * 1024 * 1024) {
        throw new Error("ভিডিও ফাইল খালি অথবা 64MB-এর বেশি");
      }

      await sock.sendMessage(
        jid,
        {
          video: buffer,
          mimetype: "video/mp4",
          caption: `${item.caption}${footer}`
        },
        message ? { quoted: message } : {}
      );
    } catch (error) {
      console.error("[VOICE COMMAND]", error);
      await reply("❌ ভিডিও লোড বা পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করো।");
    }
  }
};
