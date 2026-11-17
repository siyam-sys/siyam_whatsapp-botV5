
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AUTHOR } from "../../config.js";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCKED_AUTHOR = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const dataPath = path.join(__dirname, "cache", "custom_data.json");

let customWords = null;
let writeQueue = Promise.resolve();

async function loadData() {
  try {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });

    const content = await fs.readFile(dataPath, "utf8");
    const parsed = content ? JSON.parse(content) : {};

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed;
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("AddReply Data Load Error:", error);
    }

    return {};
  }
}

async function getData() {
  if (customWords === null) {
    customWords = await loadData();
  }

  return customWords;
}

async function saveData() {
  const snapshot = JSON.stringify(customWords, null, 2);

  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(dataPath), {
      recursive: true
    });

    const tempPath = `${dataPath}.tmp`;

    await fs.writeFile(tempPath, snapshot, "utf8");
    await fs.rename(tempPath, dataPath);
  });

  try {
    await writeQueue;
  } catch (error) {
    console.error("AddReply Data Save Error:", error);
  }
}

function makeHeader() {
  return `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────`;
}

function makeFooter() {
  return `───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
}

export default {
  config: {
    name: "addreply",
    aliases: ["ar", "কথা", "reply", "add", "টিচ"],
    version: "2.8-wa",
    author: AUTHOR,
    sourceAuthor: LOCKED_AUTHOR,
    countDown: 3,
    role: 0,

    description: {
      bn: "নিজের মতো কাস্টম কথা ও অটো রিপ্লাই সেট করুন"
    },

    category: "tool",

    guide: {
      bn:
        "addreply add <keyword> - <reply>\n" +
        "addreply del <keyword>\n" +
        "addreply list\n" +
        "addreply clear"
    }
  },

  onStart: async function ({ args, reply }) {
    // 🔒 AUTHOR LOCK CHECK
    if (this.config.sourceAuthor !== LOCKED_AUTHOR) {
      return reply(
        "⛔ AUTHOR CHANGED!\n🔒 THIS COMMAND IS LOCKED."
      );
    }

    await getData();

    const action = String(args[0] || "").toLowerCase();

    // DELETE REPLY
    if (action === "del") {
      const key = args
        .slice(1)
        .join(" ")
        .toLowerCase()
        .trim();

      if (key && Object.hasOwn(customWords, key)) {
        delete customWords[key];
        await saveData();

        return reply(
`${makeHeader()}
» 🗑️ 𝐑𝐄𝐏𝐋𝐘 𝐃𝐄𝐋𝐄𝐓𝐄𝐃
» 📌 𝐊𝐞𝐲𝐰𝐨𝐫𝐝: ${key}
${makeFooter()}`
        );
      }

      return reply(
`${makeHeader()}
» ❌ 𝐊𝐞𝐲𝐰𝐨𝐫𝐝 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝!
${makeFooter()}`
      );
    }

    // CLEAR ALL REPLIES
    if (action === "clear") {
      customWords = {};
      await saveData();

      return reply(
`${makeHeader()}
» 🧹 𝐀𝐥𝐥 𝐂𝐮𝐬𝐭𝐨𝐦 𝐑𝐞𝐩𝐥𝐢𝐞𝐬 𝐂𝐥𝐞𝐚𝐫𝐞𝐝!
${makeFooter()}`
      );
    }

    // SHOW REPLY LIST
    if (action === "list") {
      const keys = Object.keys(customWords);

      if (keys.length === 0) {
        return reply(
`${makeHeader()}
» 📭 𝐍𝐨 𝐂𝐮𝐬𝐭𝐨𝐦 𝐑𝐞𝐩𝐥𝐢𝐞𝐬 𝐅𝐨𝐮𝐧𝐝!
${makeFooter()}`
        );
      }

      let listMsg =
`${makeHeader()}
📜 𝐂𝐔𝐒𝐓𝐎𝐌 𝐑𝐄𝐏𝐋𝐘 𝐋𝐈𝐒𝐓:

`;

      keys.forEach((key, index) => {
        listMsg += `${index + 1}. ${key} ➔ ${customWords[key]}\n`;
      });

      listMsg +=
`
───────────────
» 📊 𝐓𝐨𝐭𝐚𝐥: ${keys.length}
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

      return reply(listMsg);
    }

    // ADD REPLY
    let fullInput = args.join(" ");

    if (action === "add") {
      fullInput = args.slice(1).join(" ");
    }

    if (fullInput.includes("-")) {
      const splitIndex = fullInput.indexOf("-");

      const key = fullInput
        .substring(0, splitIndex)
        .trim()
        .toLowerCase();

      const response = fullInput
        .substring(splitIndex + 1)
        .trim();

      if (key && response) {
        customWords[key] = response;
        await saveData();

        return reply(
`${makeHeader()}
» 🗣️ 𝐀𝐔𝐓𝐎 𝐑𝐄𝐏𝐋𝐘 𝐀𝐃𝐃𝐄𝐃
» 📌 𝐊𝐞𝐲𝐰𝐨𝐫𝐝: ${key}
» 💬 𝐑𝐞𝐩𝐥𝐲: ${response}
${makeFooter()}`
        );
      }
    }

    // GUIDE
    return reply(
`👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
━━━━━━━━━━━━━━
📌 𝐀𝐃𝐃𝐑𝐄𝐏𝐋𝐘 𝐆𝐔𝐈𝐃𝐄

» 𝐚𝐝𝐝𝐫𝐞𝐩𝐥𝐲 𝐚𝐝𝐝 <শব্দ> - <উত্তর>
➜ নতুন অটো রিপ্লাই যোগ হবে।

» 𝐚𝐝𝐝𝐫𝐞𝐩𝐥𝐲 𝐝𝐞𝐥 <শব্দ>
➜ নির্দিষ্ট অটো রিপ্লাই ডিলিট হবে।

» 𝐚𝐝𝐝𝐫𝐞𝐩𝐥𝐲 𝐥𝐢𝐬𝐭
➜ সব অটো রিপ্লাইয়ের তালিকা দেখাবে।

» 𝐚𝐝𝐝𝐫𝐞𝐩𝐥𝐲 𝐜𝐥𝐞𝐚𝐫
➜ সব অটো রিপ্লাই একসাথে ডিলিট হবে।

💡 𝐄𝐗𝐀𝐌𝐏𝐋𝐄:
addreply add hi - হ্যালো কেমন আছো?
(অথবা: add hi - হ্যালো কেমন আছো?)

━━━━━━━━━━━━━━
🧚‍♀️ 𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓𝐁𝐎𝐓`
    );
  },

  // AUTOMATIC REPLY
  onChat: async function ({ body, reply }) {
    const msg = String(body || "")
      .toLowerCase()
      .trim();

    if (!msg) return;

    await getData();

    // Exact keyword match
    if (Object.hasOwn(customWords, msg)) {
      return reply(customWords[msg]);
    }

    // Partial keyword match
    for (const [key, response] of Object.entries(customWords)) {
      if (key.length >= 2 && msg.includes(key)) {
        return reply(response);
      }
    }
  }
};
