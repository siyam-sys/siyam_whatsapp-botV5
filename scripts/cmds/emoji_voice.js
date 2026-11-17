
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WhatsApp Emoji Voice Auto Reply

import { AUTHOR } from "../../config.js";

const cooldowns = new Map();
const COOLDOWN_TIME = 3 * 60 * 1000;

const emojiAudioMap = {
  "🥱": ["https://files.catbox.moe/9pou40.mp3", "https://files.catbox.moe/60cwcg.mp3"],
  "😁": ["https://files.catbox.moe/60cwcg.mp3"],
  "😌": ["https://files.catbox.moe/epqwbx.mp3"],
  "🥺": ["https://files.catbox.moe/wc17iq.mp3", "https://files.catbox.moe/dv9why.mp3"],
  "🤭": ["https://files.catbox.moe/cu0mpy.mp3"],
  "😅": ["https://files.catbox.moe/jl3pzb.mp3"],
  "😏": ["https://files.catbox.moe/z9e52r.mp3"],
  "😞": ["https://files.catbox.moe/tdimtx.mp3"],
  "🤫": ["https://files.catbox.moe/0uii99.mp3"],
  "🍼": ["https://files.catbox.moe/p6ht91.mp3"],
  "🤔": ["https://files.catbox.moe/hy6m6w.mp3"],
  "🥰": ["https://files.catbox.moe/dv9why.mp3"],
  "🤦": ["https://files.catbox.moe/ivlvoq.mp3"],
  "😘": ["https://files.catbox.moe/ma2jlz.mp4", "https://files.catbox.moe/37dqpx.mp3"],
  "😑": ["https://files.catbox.moe/p78xfw.mp3"],
  "😢": ["https://files.catbox.moe/shxwj1.mp3"],
  "🙊": ["https://files.catbox.moe/3bejxv.mp3"],
  "🤨": ["https://files.catbox.moe/4aci0r.mp3"],
  "😡": ["https://files.catbox.moe/shxwj1.mp3", "https://files.catbox.moe/h9ekli.mp3"],
  "🤬": ["https://files.catbox.moe/shxwj1.mp3", "https://files.catbox.moe/h9ekli.mp3"],
  "🙈": ["https://files.catbox.moe/3qc90y.mp3"],
  "😍": ["https://files.catbox.moe/qjfk1b.mp3"],
  "😭": ["https://files.catbox.moe/itm4g0.mp3"],
  "😱": ["https://files.catbox.moe/mu0kka.mp3"],
  "😻": ["https://files.catbox.moe/y8ul2j.mp3"],
  "😿": ["https://files.catbox.moe/tqxemm.mp3"],
  "💔": ["https://files.catbox.moe/6yanv3.mp3"],
  "🤣": ["https://files.catbox.moe/2sweut.mp3", "https://files.catbox.moe/jl3pzb.mp3"],
  "🥹": ["https://files.catbox.moe/jf85xe.mp3"],
  "বট": ["https://files.catbox.moe/3u6shs.mp3"],
  "🫣": ["https://files.catbox.moe/ttb6hi.mp3"],
  "🐸": ["https://files.catbox.moe/utl83s.mp3", "https://files.catbox.moe/sg6ugl.mp3"],
  "💋": ["https://files.catbox.moe/37dqpx.mp3"],
  "🫦": ["https://files.catbox.moe/61w3i0.mp3"],
  "😴": ["https://files.catbox.moe/rm5ozj.mp3"],
  "🙏": ["https://files.catbox.moe/7avi7u.mp3"],
  "😼": ["https://files.catbox.moe/4oz916.mp3"],
  "🖕": ["https://files.catbox.moe/593u3j.mp3", "https://files.catbox.moe/dtua60.mp3"],
  "🥵": ["https://files.catbox.moe/l90704.mp3"],
  "🙂": ["https://files.catbox.moe/4oks08.mp3"],
  "😒": ["https://files.catbox.moe/mt5il0.mp3"],
  "😓": ["https://files.catbox.moe/zh3mdg.mp3"],
  "🤧": ["https://files.catbox.moe/zh3mdg.mp3"],
  "🙄": ["https://files.catbox.moe/vgzkeu.mp3"],

  "good night": ["https://files.catbox.moe/i29m4q.mp3"],
  "গুড নাইট": ["https://files.catbox.moe/i29m4q.mp3"],
  "good morning": ["https://files.catbox.moe/8gzqx5.mp3"],
  "গুড মর্নিং": ["https://files.catbox.moe/8gzqx5.mp3"],

  "siyam": ["https://files.catbox.moe/9w6moo.mp3"],
  "সিয়াম ভাই": ["https://files.catbox.moe/9w6moo.mp3"],
  "সিয়াম": ["https://files.catbox.moe/9w6moo.mp3"],
  "সিয়া.ম": ["https://files.catbox.moe/9w6moo.mp3"],
  "@পি্ঁচ্চি্ঁ উ্ঁদ্ঁয়্ঁ তা্ঁহ্ঁ": ["https://files.catbox.moe/cciqsq.mp4"],
  "@everyone": ["https://files.catbox.moe/stcply.mp3"],
  "নিঝুম": ["https://files.catbox.moe/3u6shs.mp3"],

  "👍": ["https://files.catbox.moe/4ojlc3.mp4"]
};

// সব ট্রিগার lowercase করে রাখা
const normalizedMap = new Map(
  Object.entries(emojiAudioMap).map(([key, urls]) => [
    key.trim().toLowerCase(),
    urls
  ])
);

export default {
  config: {
    name: "emoji_voice",
    aliases: ["emojivoice", "emvoice"],
    version: "2.0.2-wa",
    author: AUTHOR,
    countDown: 5,
    role: 0,
    shortDescription: "Emoji দিলে অটোমেটিক ভয়েস পাঠাবে",
    longDescription: "নির্দিষ্ট Emoji বা শব্দ পাঠালে র‍্যান্ডম ভয়েস পাঠাবে।",
    category: "SYSTEM",
    usage: "যেকোনো সেট করা Emoji পাঠাও"
  },

  onStart: async ({ reply }) => {
    await reply(
      "🎙️ Emoji Voice System চালু আছে!\n\n" +
      "যেকোনো সেট করা Emoji অথবা নির্দিষ্ট শব্দ পাঠালেই অটোমেটিক ভয়েস পাবে।"
    );
  },

  onChat: async ({ sock, jid, senderJid, body, event, reply }) => {
    if (!sock || !jid || !body) return;

    const triggerKey = body.trim().toLowerCase();
    if (!triggerKey) return;

    const audioList = normalizedMap.get(triggerKey);
    if (!audioList?.length) return;

    const sender = senderJid || jid;
    const cooldownKey = `${sender}_${triggerKey}`;
    const now = Date.now();

    const expiresAt = cooldowns.get(cooldownKey);

    if (expiresAt && now < expiresAt) return;

    const audioUrl =
      audioList[Math.floor(Math.random() * audioList.length)];

    try {
      const response = await fetch(audioUrl, {
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`Audio download failed: HTTP ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      if (!buffer.length) {
        throw new Error("Downloaded audio is empty");
      }

      const isMp4 = new URL(audioUrl).pathname.toLowerCase().endsWith(".mp4");

      if (isMp4) {
        await sock.sendMessage(
          jid,
          {
            video: buffer,
            mimetype: "video/mp4"
          },
          event ? { quoted: event } : {}
        );
      } else {
        await sock.sendMessage(
          jid,
          {
            audio: buffer,
            mimetype: "audio/mpeg",
            ptt: false
          },
          event ? { quoted: event } : {}
        );
      }

      // সফলভাবে পাঠানোর পর cooldown চালু
      cooldowns.set(cooldownKey, Date.now() + COOLDOWN_TIME);

    } catch (error) {
      console.error("[EMOJI VOICE ERROR]", error);

      if (typeof reply === "function") {
        await reply("❌ ভয়েস পাঠানো যায়নি। পরে আবার চেষ্টা করো।").catch(() => {});
      }
    }

    // পুরোনো cooldown পরিষ্কার
    if (cooldowns.size > 1000) {
      for (const [key, expiry] of cooldowns) {
        if (Date.now() >= expiry) cooldowns.delete(key);
      }
    }
  }
};
