// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// কাজ: database/users.json-এ warnings বা warnCount ৩+ থাকলে গ্রুপে সতর্কবার্তা দেয়।
// নিরাপত্তা: স্বয়ংক্রিয় Kick/Remove করা হয় না। এই বটের বর্তমান Warning command
// না থাকলে users.json-এ warning তথ্য না পাওয়ায় এই ইভেন্ট কিছু করবে না।

import { AUTHOR } from "../../config.js";
import { getUser } from "../../database/users.js";

function getWarningCount(user) {
  if (!user) return 0;
  if (typeof user.warnCount === "number") return user.warnCount;
  if (typeof user.warnings === "number") return user.warnings;
  if (Array.isArray(user.warnings)) return user.warnings.length;
  return 0;
}

export default {
  config: {
    name: "checkwarn",
    event: "group-participants.update",
    version: "1.0.0",
    author: AUTHOR,
    description: "Notify when a re-added member has three or more warnings"
  },

  onStart: async ({ sock, data }) => {
    if (data?.action !== "add" || !data?.id) return;

    for (const participant of data.participants || []) {
      const user = await getUser(participant);
      const count = getWarningCount(user);
      if (count < 3) continue;

      await sock.sendMessage(data.id, {
        text:
          `⚠️ সতর্কবার্তা\n` +
          `এই সদস্যের সংরক্ষিত Warning সংখ্যা: ${count}\n` +
          `প্রয়োজনে গ্রুপ অ্যাডমিনরা নিজেরা বিষয়টি পর্যালোচনা করুন।\n` +
          `কোনো স্বয়ংক্রিয় Kick করা হয়নি।`,
        mentions: [participant]
      });
    }
  }
};
