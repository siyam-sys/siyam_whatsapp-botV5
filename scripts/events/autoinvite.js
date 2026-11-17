// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// কেউ নিজে Leave করলে গ্রুপের Invite link সহ ভিডিও নোটিশ পাঠায়।
// WhatsApp privacy/consent-এর কারণে স্বয়ংক্রিয়ভাবে জোর করে পুনরায় Add করে না।

import { AUTHOR } from "../../config.js";

const inviteNoticeVideos = [
  "https://files.catbox.moe/uxku65.mp4",
  "https://files.catbox.moe/ol92rr.mp4"
];

export default {
  config: {
    name: "autoinvite",
    event: "group-participants.update",
    version: "2.0.0",
    author: AUTHOR,
    description: "Share a group invite link when a member voluntarily leaves"
  },

  onStart: async ({ sock, data }) => {
    if (data?.action !== "remove" || !data?.id) return;

    const actor = data.author || "";
    for (const participant of data.participants || []) {
      // Baileys-এ author == participant হলে সাধারণত নিজে Leave বোঝায়।
      if (!actor || actor !== participant) continue;
      if (participant.split("@")[0] === sock.user?.id?.split("@")[0]) continue;

      let inviteLink = "";
      try {
        const code = await sock.groupInviteCode(data.id);
        if (code) inviteLink = `https://chat.whatsapp.com/${code}`;
      } catch (error) {
        console.error("[AUTO-INVITE] Invite link unavailable; bot may not be admin.", error);
      }

      const caption =
        `👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `একজন সদস্য গ্রুপ ছেড়ে গেছেন।\n` +
        `যদি তিনি আবার যোগ দিতে চান, নিচের Invite Link ব্যবহার করতে পারবেন।\n` +
        (inviteLink ? `🔗 Group Invite: ${inviteLink}\n` : `⚠️ Invite Link তৈরি করা যায়নি। অ্যাডমিনের সাহায্য নিন।\n`) +
        `━━━━━━━━━━━━━━━━━━\n` +
        `কাউকে অনুমতি ছাড়া জোর করে Add করা হয়নি।`;

      const videoUrl = inviteNoticeVideos[Math.floor(Math.random() * inviteNoticeVideos.length)];
      try {
        await sock.sendMessage(data.id, {
          video: { url: videoUrl },
          caption
        });
      } catch (error) {
        console.error("[AUTO-INVITE] Video send failed; sending text fallback.", error);
        await sock.sendMessage(data.id, { text: caption });
      }
    }
  }
};
