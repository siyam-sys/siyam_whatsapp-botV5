
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import fs from "node:fs/promises";
import { AUTHOR } from "../../config.js";

const LOCKED_AUTHOR = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const EXPECTED_AUTHOR = "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦";

export default {
  config: {
    name: "adminonly",
    aliases: ["adonly", "onlyad", "onlyadmin", "vip"],
    version: "3.2-wa",
    author: AUTHOR,
    sourceAuthor: LOCKED_AUTHOR,
    countDown: 5,
    role: 2,

    description: {
      en: "Toggle admin-only mode"
    },

    category: "owner"
  },

  onStart: async function ({
    args,
    body,
    reply,
    config
  }) {
    // AUTHOR LOCK CHECK
    if (this.config.sourceAuthor !== LOCKED_AUTHOR) {
      return reply(
        "⛔ AUTHOR CHANGED!\n🔒 THIS COMMAND IS LOCKED."
      );
    }

    // Bot owner/admin only
    const action = String(args[0] || "").toLowerCase();
    const messageBody = String(body || "").toLowerCase().trim();

    let isSetNoti = false;
    let value;
    let indexGetVal = 0;

    // VIP ON / OFF support
    if (messageBody === "vip on") {
      args[0] = "on";
    } else if (messageBody === "vip off") {
      args[0] = "off";
    }

    if (action === "noti") {
      isSetNoti = true;
      indexGetVal = 1;
    }

    const finalAction = String(
      args[indexGetVal] || ""
    ).toLowerCase();

    if (finalAction === "on") {
      value = true;
    } else if (finalAction === "off") {
      value = false;
    } else {
      return reply(
        "❌ ভুল কমান্ড!\n\n" +
        "ব্যবহার:\n" +
        "/adminonly on\n" +
        "/adminonly off\n" +
        "/adminonly noti on\n" +
        "/adminonly noti off\n" +
        "/vip on\n" +
        "/vip off"
      );
    }

    try {
      // Notification mode
      if (isSetNoti) {
        config.hideNotiMessage ??= {};
        config.hideNotiMessage.adminOnly = !value;

        if (config.configPath) {
          await fs.writeFile(
            config.configPath,
            JSON.stringify(config, null, 2)
          );
        }

        return reply(
          value
            ? `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🔔 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 𝐎𝐍
» ⚠️ 𝐍𝐎𝐍-𝐀𝐃𝐌𝐈𝐍 𝐖𝐈𝐋𝐋 𝐒𝐄𝐄
» 🐸 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𝐌𝐄𝐒𝐒𝐀𝐆𝐄
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
            : `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🔕 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 𝐎𝐅𝐅
» 🤫 𝐍𝐎𝐍-𝐀𝐃𝐌𝐈𝐍 𝐖𝐈𝐋𝐋 𝐍𝐎𝐓
» ☠️ 𝐒𝐄𝐄 𝐀𝐍𝐘 𝐌𝐄𝐒𝐒𝐀𝐆𝐄
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗉𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
        );
      }

      // Admin-only mode
      config.adminOnly ??= {};
      config.adminOnly.enable = value;

      if (config.configPath) {
        await fs.writeFile(
          config.configPath,
          JSON.stringify(config, null, 2)
        );
      }

      return reply(
        value
          ? `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🔐 𝐀𝐃𝐌𝐈𝐍 𝐎𝐍𝐋𝐘  𝐎𝐍
» 🚫 এখন শুধু বস সিয়াম বট
» 🤧 ব্যবহার করতে পারবে
» 👑 সিয়াম বস ছাড়া কেউ
» 😮‍💨 বট ব্যবহার করতে পারবে না
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
          : `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🔓 𝐀𝐃𝐌𝐈𝐍 𝐎𝐍𝐋𝐘 𝐌𝐎𝐃𝐄 𝐎𝐅𝐅
» ✅ এখন সবাই বট
» 🌚 ব্যবহার করতে পারবে
» 🎉 সবাই এনজয় করো
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗉𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
      );

    } catch (error) {
      console.error("AdminOnly Error:", error);

      return reply(
        "❌ সেটিংস সংরক্ষণ করা যায়নি।"
      );
    }
  }
};
