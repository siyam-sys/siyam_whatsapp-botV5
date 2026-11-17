
import fs from "fs-extra";
import path from "path";
import os from "os";
import { execFileSync } from "child_process";
import { pathToFileURL } from "url";
import { AUTHOR, CONFIG } from "../../config.js";
import {
  loadCommandFile,
  unloadCommandFile,
  loadAllCommandFiles,
  unloadAllCommandFiles
} from "../../core/commandHandler.js";
import { pendingInstalls } from "../../core/commandInstallState.js";

function format(text) {
  return `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
${text}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;
}

function safeFileName(value) {
  const name = path.basename(String(value || ""));
  if (!/^[a-zA-Z0-9_-]+\.js$/i.test(name)) {
    throw new Error("Invalid file name. Use a valid .js file name.");
  }
  return name;
}

function normalizeJid(value = "") {
  return String(value).split(":")[0].trim().toLowerCase();
}

async function validateSyntax(code) {
  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "wa-command-")
  );

  const tempFile = path.join(tempDir, "check.mjs");

  try {
    await fs.writeFile(tempFile, code, "utf8");
    execFileSync(process.execPath, ["--check", tempFile], {
      stdio: "pipe"
    });
  } catch (error) {
    const detail = error.stderr?.toString() ||
      error.stdout?.toString() ||
      error.message;
    throw new Error(detail);
  } finally {
    await fs.remove(tempDir);
  }
}

async function downloadCode(url) {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are accepted");
  }

  if (parsed.hostname === "pastebin.com") {
    parsed.pathname = parsed.pathname.replace(
      /^\/(?!raw\/)/,
      "/raw/"
    );
  }

  if (parsed.hostname === "github.com") {
    const match = parsed.pathname.match(
      /^\/([^/]+)\/([^/]+)\/blob\/(.+)$/
    );

    if (match) {
      parsed.hostname = "raw.githubusercontent.com";
      parsed.pathname = `/${match[1]}/${match[2]}/${match[3]}`;
    }
  }

  const response = await fetch(parsed.href, {
    signal: AbortSignal.timeout(20000),
    redirect: "error"
  });

  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }

  const code = await response.text();

  if (!code || !code.trim()) {
    throw new Error("Downloaded code is empty");
  }

  if (Buffer.byteLength(code, "utf8") > 1024 * 1024) {
    throw new Error("File is larger than 1 MB");
  }

  return code;
}

async function installCode(fileName, code) {
  const safeName = safeFileName(fileName);
  const fullPath = path.join(CONFIG.COMMAND_DIR, safeName);

  await fs.ensureDir(CONFIG.COMMAND_DIR);
  await validateSyntax(code);

  const existed = await fs.pathExists(fullPath);
  const oldCode = existed
    ? await fs.readFile(fullPath, "utf8")
    : null;

  await fs.writeFile(fullPath, code, "utf8");

  try {
    await loadCommandFile(safeName);
  } catch (error) {
    if (existed) {
      await fs.writeFile(fullPath, oldCode, "utf8");
      try {
        await loadCommandFile(safeName);
      } catch {
      }
    } else {
      await fs.remove(fullPath);
    }

    throw error;
  }

  return safeName;
}

export async function confirmPendingInstall(
  messageId,
  reactorJid,
  emoji,
  sock
) {
  const pending = pendingInstalls.get(messageId);

  if (!pending || !emoji) return;

  if (Date.now() > pending.expiresAt) {
    pendingInstalls.delete(messageId);
    return;
  }

  if (
    normalizeJid(reactorJid) !== normalizeJid(pending.ownerJid) &&
    normalizeJid(reactorJid) !== normalizeJid(pending.ownerAltJid)
  ) {
    return;
  }

  pendingInstalls.delete(messageId);

  try {
    const fileName = await installCode(
      pending.fileName,
      pending.code
    );

    await sock.sendMessage(pending.jid, {
      text: format(
        `» ✅ ${fileName} সফলভাবে install ও load হয়েছে!`
      )
    });
  } catch (error) {
    await sock.sendMessage(pending.jid, {
      text: format(
        `» ❌ Install failed!\n» ${error.message}`
      )
    });
  }
}

export default {
  config: {
    name: "cmd",
    aliases: ["command"],
    version: "1.18",
    author: AUTHOR,
    role: 2,
    description: "Manage command files",
    category: "admin",
    guide:
      "cmd load filename\n" +
      "cmd loadall\n" +
      "cmd unload filename\n" +
      "cmd unloadall\n" +
      "cmd install URL filename.js\n" +
      "cmd install filename.js CODE",
    coolDown: 5
  },

  onStart: async function ({
    args,
    body,
    jid,
    senderJid,
    senderAltJid,
    reply
  }) {
    const action = String(args[0] || "").toLowerCase();

    try {
      if (action === "load") {
        if (!args[1]) {
          return reply(format("» ⚠️ ফাইলের নাম দিন।"));
        }

        const command = await loadCommandFile(args[1]);

        return reply(
          format(`» ✅ ${command.config.name} load হয়েছে।`)
        );
      }

      if (["loadall", "load-all"].includes(action)) {
        const result = await loadAllCommandFiles();

        return reply(format(
          `» ✅ Loaded: ${result.success.length}\n` +
          `» ❌ Failed: ${result.failed.length}\n` +
          (result.failed.length
            ? result.failed.join("\n")
            : "» সব কমান্ড load হয়েছে।")
        ));
      }

      if (action === "unload") {
        if (!args[1]) {
          return reply(format("» ⚠️ ফাইলের নাম দিন।"));
        }

        const name = await unloadCommandFile(args[1]);

        return reply(format(`» ✅ ${name} unload হয়েছে।`));
      }

      if (["unloadall", "unload-all"].includes(action)) {
        const count = unloadAllCommandFiles();

        return reply(
          format(`» ✅ ${count}টি command unload হয়েছে।`)
        );
      }

      if (action === "install") {
        if (!args[1]) {
          return reply(format("» ⚠️ URL অথবা ফাইলের নাম দিন।"));
        }

        let fileName;
        let code;

        if (/^https:\/\//i.test(args[1])) {
          if (!args[2]) {
            return reply(format("» ⚠️ ফাইলের নাম দিন।"));
          }

          fileName = safeFileName(args[2]);
          code = await downloadCode(args[1]);
        } else {
          fileName = safeFileName(args[1]);

          const filePosition = body.indexOf(args[1]);

          if (filePosition === -1) {
            return reply(format("» ❌ Code পাওয়া যায়নি।"));
          }

          code = body.slice(
            filePosition + args[1].length
          ).trim();

          if (!code) {
            return reply(format("» ⚠️ Code দিন।"));
          }
        }

        await validateSyntax(code);

        const fullPath = path.join(
          CONFIG.COMMAND_DIR,
          fileName
        );

        if (await fs.pathExists(fullPath)) {
          const prompt = await reply(format(
            `» ⚠️ ${fileName} আগে থেকেই আছে!\n` +
            `» পুরোনো ফাইল overwrite করতে যেকোনো reaction দিন।\n` +
            `» শুধু আপনার reaction গ্রহণ করা হবে।\n` +
            `» ⏳ ২ মিনিটের মধ্যে reaction দিন।`
          ));

          const messageId = prompt?.key?.id;

          if (!messageId) {
            return reply(
              format("» ❌ Confirmation message ID পাওয়া যায়নি।")
            );
          }

          pendingInstalls.set(messageId, {
            fileName,
            code,
            jid,
            ownerJid: senderJid,
            ownerAltJid: senderAltJid,
            expiresAt: Date.now() + 120000
          });

          return;
        }

        const installed = await installCode(fileName, code);

        return reply(
          format(`» ✅ ${installed} install ও load হয়েছে!`)
        );
      }

      return reply(format(
        "» ⚠️ সঠিক ব্যবহার:\n" +
        "» cmd load filename\n" +
        "» cmd loadall\n" +
        "» cmd unload filename\n" +
        "» cmd unloadall\n" +
        "» cmd install URL filename.js\n" +
        "» cmd install filename.js CODE"
      ));
    } catch (error) {
      console.error("CMD MANAGER ERROR:", error);

      return reply(format(
        `» ❌ সমস্যা হয়েছে!\n» ${error.message}`
      ));
    }
  }
};
