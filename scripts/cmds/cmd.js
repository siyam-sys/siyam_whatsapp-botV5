// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WhatsApp command manager adapted from the original Messenger cmd.js.

import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";
import { AUTHOR, CONFIG } from "../../config.js";
import { loadCommands, getCommands } from "../../core/commandHandler.js";

const commandDir = path.resolve(process.cwd(), CONFIG.COMMAND_DIR);

function isManager(permission) {
  return ["OWNER", "BOT_ADMIN"].includes(permission?.role);
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
    role: "BOT_ADMIN",
    category: "SYSTEM",
    shortDescription: "Manage command files",
    longDescription: "Load, unload, reload and install trusted command files.",
    usage: "{pn} load <file> | unload <file> | loadAll | unloadAll | install <raw-url> <file.js>"
  },

  onStart: async ({ args = [], reply, permission }) => {
    if (!isManager(permission)) {
      return reply("⛔ এই কমান্ড শুধু Bot Admin ব্যবহার করতে পারবেন।");
    }

    const action = String(args[0] || "").toLowerCase();
    const fileName = safeFileName(args[1] || "");

    try {
      if (["loadall", "load-all", "reload", "reloadall"].includes(action)) {
        await loadCommands();
        return reply(`✅ সব Command আবার Load করা হয়েছে।\n📊 Loaded: ${getCommands().size}`);
      }

      if (action === "load" || action === "unload") {
        if (!fileName) return reply("⚠️ ফাইলের নাম দিন। উদাহরণ: /cmd load gan");

        if (action === "unload") {
          const removed = removeFromRegistry(fileName);
          return reply(removed
            ? `✅ ${fileName} মেমোরি থেকে Unload হয়েছে। ফাইলটি মুছে ফেলা হয়নি।`
            : `⚠️ ${fileName} বর্তমানে Load করা নেই।`);
        }

        if (!(await fs.pathExists(path.join(commandDir, fileName)))) {
          return reply(`❌ ${fileName} ফাইলটি পাওয়া যায়নি।`);
        }
        await loadCommands();
        const loaded = getCommands().has(path.basename(fileName, ".js").toLowerCase());
        return reply(loaded ? `✅ ${fileName} Load হয়েছে।` : `❌ ${fileName} Load হয়নি। Author/config পরীক্ষা করুন।`);
      }

      if (["unloadall", "unload-all"].includes(action)) {
        const map = getCommands();
        const self = map.get("cmd");
        map.clear();
        if (self) {
          map.set("cmd", self);
          for (const alias of self.config.aliases || []) map.set(String(alias).toLowerCase(), self);
        }
        return reply("✅ cmd কমান্ড বাদে বাকি সব Command মেমোরি থেকে Unload হয়েছে।");
      }

      if (action === "install") {
        const url = args[1];
        const installName = safeFileName(args[2] || "");
        if (!url || !installName || !/^https:\/\/raw\.githubusercontent\.com\//i.test(url)) {
          return reply("⚠️ ব্যবহার: /cmd install https://raw.githubusercontent.com/owner/repo/branch/file.js file.js\nশুধু trusted raw GitHub URL ব্যবহার করুন।");
        }

        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
        const source = await response.text();
        if (!source.trim() || source.length > 250_000) throw new Error("ফাইল খালি অথবা অনুমোদিত সাইজের চেয়ে বড়।");
        if (!source.includes(`AUTHOR: ${AUTHOR}`) || !source.includes(`author: "${AUTHOR}"`) && !source.includes(`author: '${AUTHOR}'`)) {
          throw new Error("এই ফাইলটি তোমার WhatsApp bot-এর AUTHOR format মেনে চলে না।");
        }

        const destination = path.join(commandDir, installName);
        if (await fs.pathExists(destination)) {
          return reply(`⚠️ ${installName} আগে থেকেই আছে। আগে backup নিয়ে পুরোনো ফাইল সরিয়ে তারপর Install করো।`);
        }

        // Only trusted source code should be installed: loading a command executes its JavaScript.
        await fs.writeFile(destination, source, "utf8");
        await loadCommands();
        const loaded = getCommands().has(path.basename(installName, ".js").toLowerCase());
        if (!loaded) {
          await fs.remove(destination);
          throw new Error("ফাইলটি Command হিসেবে Load হয়নি; নিরাপত্তার জন্য ডাউনলোড করা ফাইল সরানো হয়েছে।");
        }
        return reply(`✅ ${installName} Install ও Load হয়েছে।`);
      }

      return reply(
        "┏━━━━━━━━━━━━━━━━━━┓\n" +
        "       🧩 𝐂𝐌𝐃 𝐌𝐀𝐍𝐀𝐆𝐄𝐑\n" +
        "┗━━━━━━━━━━━━━━━━━━┛\n\n" +
        "➤ /cmd load <file>\n" +
        "➤ /cmd loadAll\n" +
        "➤ /cmd unload <file>\n" +
        "➤ /cmd unloadAll\n" +
        "➤ /cmd install <raw GitHub URL> <file.js>\n\n" +
        "⚠️ শুধু পরিচিত ও বিশ্বাসযোগ্য কোড Install করবে।"
      );
    } catch (error) {
      console.error("[CMD MANAGER]", error);
      return reply(`❌ কাজটি সম্পন্ন হয়নি: ${error.message}`);
    }
  }
};
