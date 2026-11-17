// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import fs from "fs-extra";
import path from "path";
import { CONFIG, AUTHOR, isOwner } from "../../config.js";

export default {
  config: {
    name: "file",
    aliases: ["filecmd"],
    version: "2.5-wa",
    author: AUTHOR,
    countDown: 5,
    role: "OWNER",
    shortDescription: "View command source code",
    longDescription: "View source code of a command",
    category: "owner",
    description: "Show command file source code",
    guide: "{pn} <commandName>"
  },

  onStart: async ({ args, senderJid, reply }) => {
    // Owner permission check
    if (!isOwner(senderJid)) {
      return reply(`
𝗢𝗪𝗡𝗘𝗥 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
───────────────
» 👑 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
» ❌ এই কমান্ডটি শুধু বট Owner ব্যবহার করতে পারবে।
───────────────
» 👑 𝆠፝𝐍𝐈𝐉𝐇𝐔𝐌-𝐁𝐎𝐓 👑
      `);
    }

    const cmdName = String(args[0] || "").trim();

    if (!cmdName) {
      return reply(
        "❌ | Please provide command name.\nExample: /file help"
      );
    }

    // Prevent path traversal
    if (
      !/^[a-zA-Z0-9_.+-]+$/.test(cmdName) ||
      cmdName === "." ||
      cmdName === ".."
    ) {
      return reply("❌ | Invalid command name.");
    }

    const commandDir = path.resolve(CONFIG.COMMAND_DIR);
    const cmdPath = path.resolve(commandDir, `${cmdName}.js`);

    if (path.dirname(cmdPath) !== commandDir) {
      return reply("❌ | Invalid file path.");
    }

    if (!(await fs.pathExists(cmdPath))) {
      return reply(`❌ | Command "${cmdName}" not found.`);
    }

    try {
      const code = await fs.readFile(cmdPath, "utf8");

      if (code.length > 14000) {
        return reply("⚠️ | File too large to display.");
      }

      return reply(
        `📄 | Source code of "${cmdName}.js":\n\n` +
        "```javascript\n" +
        code +
        "\n```"
      );

    } catch (error) {
      console.error("[FILE COMMAND ERROR]", error);
      return reply("❌ | Error reading file.");
    }
  }
};
