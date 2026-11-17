// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// Bot গ্রুপে Add হলে পরিচিতিমূলক ছবি+মেসেজ; নতুন সদস্য এলে Welcome message।

import { AUTHOR, CONFIG } from "../../config.js";
import { getGroup } from "../../database/groups.js";

const botJoinImages = [
  "https://i.imgur.com/y5a5BBP.jpeg",
  "https://i.imgur.com/586Aq55.jpeg"
];

const SPECIAL_GROUP_JID = process.env.SPECIAL_WELCOME_GROUP || "";
const SPECIAL_RULES = `📜 𝐆𝐑𝐎𝐔𝐏 𝐑𝐔𝐋𝐄𝐒\n\n১. সবাইকে সম্মান করুন।\n২. অপ্রয়োজনীয় স্প্যাম করবেন না।\n৩. অশালীন বা বেআইনি কনটেন্ট শেয়ার করবেন না।\n৪. সমস্যা হলে গ্রুপ অ্যাডমিনের সঙ্গে যোগাযোগ করুন।`;

export default {
  config: {
    name: "welcome",
    event: "group-participants.update",
    version: "2.0.0",
    author: AUTHOR,
    description: "Welcome new members and announce when the bot joins a group"
  },

  onStart: async ({ sock, data }) => {
    if (data?.action !== "add" || !data?.id) return;
    const group = await getGroup(data.id);
    if (group.welcome === false) return;

    let groupName = data.id;
    let memberCount = "Unknown";
    try {
      const metadata = await sock.groupMetadata(data.id);
      groupName = metadata.subject || groupName;
      memberCount = metadata.participants?.length ?? memberCount;
    } catch (error) {
      console.error("[WELCOME] Could not fetch group metadata:", error.message);
    }

    const botJid = sock.user?.id || "";
    for (const participant of data.participants || []) {
      const isBot = participant.split("@")[0] === botJid.split("@")[0];
      if (isBot) {
        const imageUrl = botJoinImages[Math.floor(Math.random() * botJoinImages.length)];
        const caption =
          `✨ 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 ✨\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `🤖 আমি ${CONFIG.BOT_NAME}\n` +
          `❤️ আমাকে গ্রুপে Add করার জন্য ধন্যবাদ।\n` +
          `🏠 গ্রুপ: ${groupName}\n` +
          `👥 সদস্য: ${memberCount}\n` +
          `⌨️ Prefix: ${CONFIG.PREFIX}\n` +
          `📖 ${CONFIG.PREFIX}help লিখে কমান্ড দেখুন।\n` +
          `👑 Owner: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦\n` +
          `━━━━━━━━━━━━━━━━━━\nসবাইকে স্বাগতম!`;
        try {
          await sock.sendMessage(data.id, {
            image: { url: imageUrl },
            caption
          });
        } catch (error) {
          console.error("[WELCOME] Bot join image failed; text fallback.", error);
          await sock.sendMessage(data.id, { text: caption });
        }
        continue;
      }

      if (SPECIAL_GROUP_JID && data.id === SPECIAL_GROUP_JID) {
        await sock.sendMessage(data.id, {
          text: `📢 স্বাগতম @${participant.split("@")[0]}\n\n${SPECIAL_RULES}\n\n👑 𝐎𝐖𝐍𝐄𝐑 ➜ 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦`,
          mentions: [participant]
        });
        continue;
      }

      await sock.sendMessage(data.id, {
        text:
          `🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌸\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `🌷 সদস্য: @${participant.split("@")[0]}\n` +
          `🏷️ গ্রুপ: ${groupName}\n` +
          `👥 Member: ${memberCount}\n` +
          `✨ গ্রুপের নিয়ম মেনে আনন্দের সঙ্গে থাকুন।\n` +
          `━━━━━━━━━━━━━━━━━━\n𝐄𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐬𝐭𝐚𝐲! 😊`,
        mentions: [participant]
      });
    }
  }
};
