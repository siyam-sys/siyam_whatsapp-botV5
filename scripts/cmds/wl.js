
import fs from "fs-extra";
import moment from "moment-timezone";

import {
  CONFIG,
  AUTHOR,
  isOwner,
  isBotAdmin,
  normalizeWhatsAppId
} from "../../config.js";

const FILE = CONFIG.DATABASE.WHITELIST_FILE;

const footer =
  "───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧";

async function readList() {
  await fs.ensureDir(CONFIG.DATABASE.DIRECTORY);

  if (!(await fs.pathExists(FILE))) {
    return {
      enabled: false,
      ids: [...CONFIG.WHITELIST_IDS]
    };
  }

  const data = await fs.readJson(FILE);

  return {
    enabled: Boolean(data.enabled),
    ids: Array.isArray(data.ids)
      ? [...new Set(
          data.ids.map(normalizeWhatsAppId).filter(Boolean)
        )]
      : [...CONFIG.WHITELIST_IDS]
  };
}

async function save(data) {
  await fs.ensureDir(CONFIG.DATABASE.DIRECTORY);
  await fs.writeJson(FILE, data, { spaces: 2 });
}

export default {
  config: {
    name: "wl",
    version: "3.0",
    author: AUTHOR,
    countDown: 5,
    role: 2,
    category: "owner",
    description: "Manage whitelist UID",
    guide:
      "{pn} add <uid>\n" +
      "{pn} remove <uid>\n" +
      "{pn} list\n" +
      "{pn} on / off"
  },

  onStart: async function ({ args = [], senderJid, reply }) {
    if (!isBotAdmin(senderJid)) {
      return reply(
        "🚫 𝗢𝗻𝗹𝘆 𝗠𝘆 𝗕𝗼𝘀𝘀 𝐒𝐈𝐘𝐀𝐌 তুই আবাল 🌚 সর এখান থেকে🙄🐸"
      );
    }

    try {
      const action = String(args[0] || "").toLowerCase();
      const data = await readList();

      switch (action) {
        case "add":
        case "-a": {
          if (!args[1]) {
            return reply(
              "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n" +
              "───────────────\n" +
              "» ⚠️ 𝐆𝐢𝐯𝐞 𝐔𝐈𝐃 𝐨𝐫 𝐍𝐮𝐦𝐛𝐞𝐫!\n" +
              footer
            );
          }

          const ids = args
            .slice(1)
            .map(normalizeWhatsAppId)
            .filter(Boolean);

          const added = [];

          for (const id of ids) {
            if (!data.ids.includes(id)) {
              data.ids.push(id);
              added.push(id);
            }
          }

          await save(data);

          return reply(
            `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n` +
            `───────────────\n` +
            `» ✅ 𝐀𝐝𝐝𝐞𝐝:\n` +
            `${added.join("\n") || "Already exists"}\n` +
            footer
          );
        }

        case "remove":
        case "-r": {
          if (!args[1]) {
            return reply(
              "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n" +
              "───────────────\n" +
              "» ⚠️ 𝐆𝐢𝐯𝐞 𝐔𝐈𝐃 𝐨𝐫 𝐍𝐮𝐦𝐛𝐞𝐫!\n" +
              footer
            );
          }

          const ids = args
            .slice(1)
            .map(normalizeWhatsAppId)
            .filter(Boolean);

          const ownerId = normalizeWhatsAppId(CONFIG.OWNER_ID);

          const protectedIds = ids.filter(id => id === ownerId);
          const removableIds = ids.filter(id => id !== ownerId);

          const removed = removableIds.filter(
            id => data.ids.includes(id)
          );

          data.ids = data.ids.filter(
            id => !removableIds.includes(id)
          );

          await save(data);

          return reply(
            `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n` +
            `───────────────\n` +
            `» ✅ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝:\n` +
            `${removed.join("\n") || "No matching UID"}\n` +
            `${protectedIds.length ? "\n⚠️ Main Owner cannot be removed." : ""}` +
            footer
          );
        }

        case "list":
        case "-l": {
          return reply(
            `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n` +
            `───────────────\n` +
            `» 👑 𝐖𝐡𝐢𝐭𝐞𝐋𝐢𝐬𝐭 𝐔𝐬𝐞𝐫𝐬:\n` +
            `${data.ids.map(id => "• " + id).join("\n") || "Empty"}\n` +
            `» 🔐 Status: ${data.enabled ? "ON" : "OFF"}\n` +
            footer
          );
        }

        case "on":
        case "off": {
          data.enabled = action === "on";

          await save(data);

          const time = moment()
            .tz("Asia/Dhaka")
            .format("hh:mm A");

          const date = moment()
            .tz("Asia/Dhaka")
            .format("DD MMMM YYYY");

          return reply(
            `👑  𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍  👑\n\n` +
            `𝆠፝𝐖𝐇𝐈𝐓𝐄 𝐋𝐈𝐒𝐓 𝐌𝐎𝐃𝐄 ${data.enabled ? "𝐄𝐍𝐀𝐁𝐋𝐄𝐃" : "𝐃𝐈𝐒𝐀𝐁𝐋𝐄𝐃"}\n\n` +
            `🔐  𝆠፝𝐀𝐂𝐂𝐄𝐒𝐒 :\n` +
            `   ${data.enabled ? "শুধু তালিকাভুক্ত ব্যবহারকারী" : "এখন সবাই বট ব্যবহার করতে পারবে"}\n\n` +
            `📅  𝆠፝𝐃𝐚𝐭𝐞 : ${date}\n` +
            `⏰  𝆠፝𝐓𝐢𝐦𝐞 : ${time}\n\n` +
            `👑  𝆠፝𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓 𝐁𝐎𝐓  👑`
          );
        }

        default:
          return reply(
            "» 👑 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓\n\n" +
            "wl add <UID>\n" +
            "wl remove <UID>\n" +
            "wl list\n" +
            "wl on\n" +
            "wl off\n\n" +
            footer
          );
      }
    } catch (error) {
      console.error("[WL]", error);
      return reply("❌ Whitelist আপডেট করতে সমস্যা হয়েছে।");
    }
  }
};
