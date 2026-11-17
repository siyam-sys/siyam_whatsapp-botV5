// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// নিজে Leave করলে Goodbye message পাঠায়। Admin kick করলে আলাদা Removed notice দেয়।

import { AUTHOR } from "../../config.js";
import { getGroup } from "../../database/groups.js";

export default {
  config: {
    name: "leave",
    event: "group-participants.update",
    version: "2.0.0",
    author: AUTHOR,
    description: "Send a goodbye or removal notice for group participant changes"
  },

  onStart: async ({ sock, data }) => {
    if (data?.action !== "remove" || !data?.id) return;
    const group = await getGroup(data.id);
    if (group.goodbye === false) return;

    const actor = data.author || "";
    for (const participant of data.participants || []) {
      if (participant.split("@")[0] === sock.user?.id?.split("@")[0]) continue;
      const voluntarilyLeft = actor && actor === participant;
      const displayName = `@${participant.split("@")[0]}`;
      const text = voluntarilyLeft
        ? `👋 বিদায়!\n${displayName} নিজে গ্রুপ ছেড়ে গেছেন।\nতার পরবর্তী পথচলার জন্য শুভকামনা রইল।`
        : `📢 গ্রুপ আপডেট\n${displayName} গ্রুপ থেকে Remove হয়েছেন।`;

      await sock.sendMessage(data.id, {
        text,
        mentions: [participant]
      });
    }
  }
};
