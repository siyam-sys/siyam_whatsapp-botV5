// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// কাজ: Bot-কে কোনো গ্রুপে Add/Remove করলে নির্দিষ্ট WhatsApp লগ গ্রুপে খবর পাঠায়।
// নিরাপত্তা: পুরোনো Messenger ফাইলে থাকা Telegram token এখানে রাখা হয়নি।
// .env ফাইলে EVENT_LOG_JID=120xxxxxxxxxxxx@g.us বসাতে হবে।

import { AUTHOR, CONFIG } from "../../config.js";

function sameJid(a = "", b = "") {
  const clean = value => String(value).split(":")[0].toLowerCase();
  return Boolean(a && b && clean(a) === clean(b));
}

export default {
  config: {
    name: "botLogger",
    event: "group-participants.update",
    version: "1.0.0",
    author: AUTHOR,
    description: "Log bot group join and removal events"
  },

  onStart: async ({ sock, data }) => {
    const logJid = process.env.EVENT_LOG_JID;
    if (!logJid || !logJid.endsWith("@g.us")) return;
    if (!data?.id || !Array.isArray(data.participants)) return;

    const botJid = sock.user?.id || "";
    const botWasAffected = data.participants.some(id => sameJid(id, botJid));
    if (!botWasAffected) return;

    let groupName = data.id;
    try {
      const metadata = await sock.groupMetadata(data.id);
      groupName = metadata.subject || groupName;
    } catch {
      // Metadata না পেলে Group JID-ই দেখানো হবে।
    }

    const actionText = data.action === "add"
      ? "গ্রুপে যুক্ত হয়েছে"
      : data.action === "remove"
        ? "গ্রুপ থেকে Remove হয়েছে"
        : `গ্রুপে পরিবর্তন হয়েছে (${data.action || "unknown"})`;

    const text =
      `🤖 BOT GROUP LOG\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `বট: ${CONFIG.BOT_NAME}\n` +
      `অ্যাকশন: ${actionText}\n` +
      `গ্রুপ: ${groupName}\n` +
      `গ্রুপ JID: ${data.id}\n` +
      `পরিবর্তনকারী: ${data.author || "Unknown"}\n` +
      `সময়: ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}\n` +
      `━━━━━━━━━━━━━━━━━━`;

    await sock.sendMessage(logJid, { text });
  }
};
