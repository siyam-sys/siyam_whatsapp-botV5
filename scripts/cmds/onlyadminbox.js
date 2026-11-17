
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import { AUTHOR } from "../../config.js";
import { updateGroup } from "../../database/groups.js";

// 🔒 SOURCE AUTHOR LOCK
const OWNER_NAME = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const ANTI_TAMPER = "𝆠፝";
const hiddenOwner = ANTI_TAMPER + OWNER_NAME;
const EXPECTED_OWNER = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const AUTHOR_LOCK_VALID = hiddenOwner === EXPECTED_OWNER;

export default {
  config: {
    name: "onlyadminbox",
    aliases: [
      "onlyadbox",
      "adboxonly",
      "adminboxonly"
    ],
    version: "1.3-wa",
    author: AUTHOR,
    sourceAuthor: hiddenOwner,
    countDown: 5,
    role: 2,
    description: "Turn on/off only group admins can use the bot.",
    category: "group",

    guide: {
      en:
        "{pn} on: Enable admin-only mode\n" +
        "{pn} off: Disable admin-only mode\n" +
        "{pn} noti on: Enable notification\n" +
        "{pn} noti off: Disable notification"
    }
  },

  onStart: async function ({
    args,
    jid,
    isGroup,
    permission,
    config,
    reply
  }) {

    // 🔒 AUTHOR LOCK CHECK
    if (
      !AUTHOR_LOCK_VALID ||
      config?.sourceAuthor !== EXPECTED_OWNER
    ) {
      return reply(
        "⛔ AUTHOR CHANGED!\n🔒 THIS COMMAND IS LOCKED."
      );
    }

    // Group only
    if (!isGroup || !jid?.endsWith("@g.us")) {
      return reply(
        "⚠️ এই কমান্ডটি শুধু WhatsApp Group-এ ব্যবহার করা যাবে।"
      );
    }

    // Bot Admin only
    if (permission?.roleLevel !== 2) {
      return reply(
        "⛔ এই কমান্ড ব্যবহার করার অনুমতি শুধু Bot Admin-এর আছে।"
      );
    }

    const isSetNoti =
      String(args[0] || "").toLowerCase() === "noti";

    const valueIndex = isSetNoti ? 1 : 0;
    const valueArg = String(
      args[valueIndex] || ""
    ).toLowerCase();

    if (valueArg !== "on" && valueArg !== "off") {
      return reply(
        "❌ ভুল কমান্ড!\n\n" +
        "ব্যবহার:\n" +
        "• /onlyadminbox on\n" +
        "• /onlyadminbox off\n" +
        "• /onlyadminbox noti on\n" +
        "• /onlyadminbox noti off"
      );
    }

    const value = valueArg === "on";

    try {
      if (isSetNoti) {
        // noti on = hide notification false
        await updateGroup(jid, {
          hideNotiMessageOnlyAdminBox: !value
        });

        return reply(
          value
            ? "✅ Turned on the notification when non-admin users use the bot."
            : "✅ Turned off the notification when non-admin users use the bot."
        );
      }

      await updateGroup(jid, {
        onlyAdminBox: value
      });

      return reply(
        value
          ? "✅ Turned on Only Admin Box mode. Only group admins should be allowed to use the bot."
          : "✅ Turned off Only Admin Box mode. All group members can use the bot."
      );

    } catch (error) {
      console.error("OnlyAdminBox Error:", error);

      return reply(
        "❌ সেটিংস পরিবর্তন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    }
  }
};
