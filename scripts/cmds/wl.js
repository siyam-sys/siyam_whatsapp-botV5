
import fs from "fs-extra";
import path from "path";
import { AUTHOR, CONFIG } from "../../config.js";
import { loadCommands, getCommands } from "../../core/commandHandler.js";

const commandDir = path.resolve(process.cwd(), CONFIG.COMMAND_DIR);

function isManager(permission) {
  return (permission?.roleLevel ?? 0) >= 2 ||
    ["OWNER", "BOT_ADMIN"].includes(permission?.role);
}

function safeFileName(value = "") {
  const name = path.basename(String(value)).replace(/\.js$/i, "");
  return /^[a-zA-Z0-9_-]{1,64}$/.test(name) ? `${name}.js` : null;
}

function removeFromRegistry(fileName) {
  const map = getCommands();
  const base = path.basename(fileName, ".js").toLowerCase();
  const target = map.get(base);
  if (!target) return false;

  for (const [key, command] of map.entries()) {
    if (command === target) map.delete(key);
  }
  return true;
}

export default {
  config: {
    name: "cmd",
    aliases: ["command"],
    version: "2.0.0",
    author: AUTHOR,
    role: 2,
    category: "SYSTEM",
    shortDescription: "Manage command files",
    longDescription: "Load, unload, reload and install trusted command files.",
    usage: "{pn} load <file> | unload <file> | loadAll | unloadAll | install <raw-url> <file.js>"
  },

  onStart: async ({ args = [], reply, permission }) => {
    if (!isManager(permission)) {
      return reply("⛔ শুধু Bot Admin ব্যবহার করতে পারবেন।");
    }

    const action = String(args[0] || "").toLowerCase();
    const fileName = safeFileName(args[1] || "");

    try {
      if (["loadall", "load-all", "reload", "reloadall"].includes(action)) {
        await loadCommands();
        return reply(`✅ সব Command Load হয়েছে। Loaded: ${getCommands().size}`);
      }

      if (action === "load" || action === "unload") {
        if (!fileName) return reply("⚠️ ফাইলের নাম দিন।");

        if (action === "unload") {
          const removed = removeFromRegistry(fileName);
          return reply(removed
            ? `✅ ${fileName} Unload হয়েছে।`
            : `⚠️ ${fileName} Load করা নেই।`);
        }

        if (!(await fs.pathExists(path.join(commandDir, fileName)))) {
          return reply(`❌ ${fileName} পাওয়া যায়নি।`);
        }

        await loadCommands();
        const loaded = getCommands().has(path.basename(fileName, ".js").toLowerCase());

        return reply(loaded ? `✅ ${fileName} Load হয়েছে।` : `❌ ${fileName} Load হয়নি।`);
      }

      if (["unloadall", "unload-all"].includes(action)) {
        const map = getCommands();
        const self = map.get("cmd");
        map.clear();

        if (self) {
          map.set("cmd", self);
          for (const alias of self.config.aliases || []) {
            map.set(String(alias).toLowerCase(), self);
          }
        }

        return reply("✅ cmd বাদে বাকি Command Unload হয়েছে।");
      }

      if (action === "install") {
        const url = args[1];
        const installName = safeFileName(args[2] || "");

        if (!url || !installName || !/^https:\/\/raw\.githubusercontent\.com\//i.test(url)) {
          return reply("⚠️ Trusted raw GitHub URL এবং file name দিন।");
        }

        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const source = await response.text();

        if (!source.trim() || source.length > 250000) {
          throw new Error("ফাইল খালি অথবা অনেক বড়।");
        }

        if (
          !source.includes(`AUTHOR: ${AUTHOR}`) &&
          !source.includes(`author: "${AUTHOR}"`) &&
          !source.includes(`author: '${AUTHOR}'`)
        ) {
          throw new Error("AUTHOR format মেলেনি।");
        }

        const destination = path.join(commandDir, installName);

        if (await fs.pathExists(destination)) {
          return reply("⚠️ এই ফাইল আগে থেকেই আছে।");
        }

        await fs.writeFile(destination, source, "utf8");
        await loadCommands();

        const loaded = getCommands().has(path.basename(installName, ".js").toLowerCase());

        if (!loaded) {
          await fs.remove(destination);
          throw new Error("Command Load হয়নি।");
        }

        return reply(`✅ ${installName} Install হয়েছে।`);
      }

      return reply(
        "🧩 CMD MANAGER\n\n" +
        "/cmd load <file>\n" +
        "/cmd loadAll\n" +
        "/cmd unload <file>\n" +
        "/cmd unloadAll\n" +
        "/cmd install <raw GitHub URL> <file.js>"
      );
    } catch (error) {
      console.error("[CMD MANAGER]", error);
      return reply(`❌ কাজটি হয়নি: ${error.message}`);
    }
  }
};
