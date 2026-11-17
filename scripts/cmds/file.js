
import fs from "fs-extra";
import path from "path";
import { CONFIG, AUTHOR } from "../../config.js";

export default {
  config: {
    name: "file",
    aliases: ["filecmd"],
    version: "3.0",
    author: AUTHOR,
    countDown: 5,
    role: 2,
    shortDescription: "View command source code",
    longDescription: "View source code of a command",
    category: "owner",
    description: "Show command file source code",
    guide: "{pn} <commandName>"
  },

  onStart: async ({ args = [], permission, reply }) => {
    if ((permission?.roleLevel ?? 0) < 2) {
      return reply("❌ শুধু Bot Admin অথবা Bot Owner ব্যবহার করতে পারবেন।");
    }

    const cmdName = String(args[0] || "").trim();

    if (!cmdName) {
      return reply("❌ Command name দিন। উদাহরণ: /file help");
    }

    if (!/^[a-zA-Z0-9_.+-]+$/.test(cmdName) || cmdName === "." || cmdName === "..") {
      return reply("❌ Invalid command name.");
    }

    const commandDir = path.resolve(CONFIG.COMMAND_DIR);
    const cmdPath = path.resolve(commandDir, `${cmdName}.js`);

    if (path.dirname(cmdPath) !== commandDir) {
      return reply("❌ Invalid file path.");
    }

    if (!(await fs.pathExists(cmdPath))) {
      return reply(`❌ Command "${cmdName}" পাওয়া যায়নি।`);
    }

    try {
      const code = await fs.readFile(cmdPath, "utf8");

      if (code.length > 14000) {
        return reply("⚠️ File size অনেক বড়।");
      }

      return reply(
        `📄 Source code: ${cmdName}.js\n\n` +
        "```javascript\n" + code + "\n```"
      );
    } catch (error) {
      console.error("[FILE COMMAND]", error);
      return reply("❌ File পড়তে সমস্যা হয়েছে।");
    }
  }
};
