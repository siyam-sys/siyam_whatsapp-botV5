// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// Messenger-এর autoUpdateInfoThread.js থেকে WhatsApp Baileys-এর জন্য রূপান্তরিত।
// কাজ: গ্রুপের নাম/বর্ণনা/সেটিংস বদলালে database/groups.json-এ সংরক্ষণ।

import { AUTHOR } from "../../config.js";
import { updateGroup } from "../../database/groups.js";

export default {
  config: {
    name: "autoUpdateInfoThread",
    event: "groups.update",
    version: "1.0.0",
    author: AUTHOR,
    description: "Save WhatsApp group metadata updates"
  },

  onStart: async ({ data }) => {
    const updates = Array.isArray(data) ? data : [data];

    for (const item of updates) {
      if (!item?.id || !item.id.endsWith("@g.us")) continue;

      const changes = {};
      if (typeof item.subject === "string") changes.subject = item.subject;
      if (typeof item.desc === "string") changes.description = item.desc;
      if (typeof item.announce === "boolean") changes.announceOnly = item.announce;
      if (typeof item.restrict === "boolean") changes.restrictInfo = item.restrict;
      if (typeof item.author === "string") changes.lastChangedBy = item.author;

      if (Object.keys(changes).length) {
        await updateGroup(item.id, {
          ...changes,
          lastMetadataUpdate: Date.now()
        });
      }
    }
  }
};
