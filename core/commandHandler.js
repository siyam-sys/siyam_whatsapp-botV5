// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";

import { CONFIG, AUTHOR } from "../config.js";
import { checkPermission } from "./permission.js";
import { handleError } from "./errorHandler.js";
import { createLogger } from "../system/logger.js";
import { readData } from "../database/index.js";
import { getGroup } from "../database/groups.js";

const logger = createLogger();

const commands = new Map();
const replySessions = new Map();
const firstChats = new Set();
const cooldowns = new Map();
const loadedFiles = new Map();

const MAX_REPLY_SESSIONS = 500;
const REPLY_SESSION_TTL = 24 * 60 * 60 * 1000;

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeAliases(aliases) {
  if (!aliases) return [];

  const list = Array.isArray(aliases) ? aliases : [aliases];

  return list.map(normalize).filter(Boolean);
}

function formatMessage(template, ...values) {
  return String(template).replace(/%(\d+)/g, (match, index) => {
    const value = values[Number(index) - 1];
    return value === undefined ? match : String(value);
  });
}

async function getPrefixes(context) {
  let globalPrefix = CONFIG.PREFIX || "/";

  try {
    const saved = await readData("prefix", {
      prefix: globalPrefix
    });

    globalPrefix = saved?.prefix || globalPrefix;
  } catch {}

  let groupPrefix = globalPrefix;

  if (context.isGroup) {
    try {
      const group = await getGroup(context.jid);
      groupPrefix = group?.prefix || globalPrefix;
    } catch {
      groupPrefix = globalPrefix;
    }
  }

  return [...new Set([groupPrefix, globalPrefix].filter(Boolean))]
    .sort((a, b) => b.length - a.length);
}

function getLanguageMessage(key, ...values) {
  const messages = {
    commandNotFound:
      '🤷‍♂️ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 "%1" 𝗱𝗼𝗲𝘀 𝗻𝗼𝘁 𝗲𝘅𝗶𝘀𝘁, 𝘁𝘆𝗽𝗲 %2𝗵𝗲𝗹𝗽 𝘁𝗼 𝘀𝗲𝗲 𝗮𝗹𝗹 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 📜',
    onlyPrefix:
      "🤖 𝗧𝗵𝗮𝘁'𝘀 𝗷𝘂𝘀𝘁 𝗺𝘆 𝗽𝗿𝗲𝗳𝗶𝘅! 𝗧𝘆𝗽𝗲 %1𝗵𝗲𝗹𝗽 𝘁𝗼 𝘀𝗲𝗲 𝗮𝗹𝗹 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 ✨",
    onlyAdmin:
      "🚫 𝗢𝗻𝗹𝘆 𝗠𝘆 𝗕𝗼𝘀𝘀 𝐒𝐈𝐘𝐀𝐌 তুই আবাল 🌚 সর এখান থেকে🙄🐸",
    cannotFindCommandName:
      "❌ 𝗖𝗮𝗻𝗻𝗼𝘁 𝗳𝗶𝗻𝗱 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗻𝗮𝗺𝗲 𝘁𝗼 𝗲𝘅𝗲𝗰𝘂𝘁𝗲 𝘁𝗵𝗶𝘀 𝗿𝗲𝗽𝗹𝘆! 🤷‍♂️",
    cannotFindCommand:
      '❌ 𝗖𝗮𝗻𝗻𝗼𝘁 𝗳𝗶𝗻𝗱 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 "%1" 𝘁𝗼 𝗲𝘅𝗲𝗰𝘂𝘁𝗲 𝘁𝗵𝗶𝘀 𝗿𝗲𝗽𝗹𝘆! 🔍'
  };

  return formatMessage(messages[key] || key, ...values);
}

function removeCommand(command) {
  if (!command) return;

  for (const [name, registered] of commands.entries()) {
    if (registered === command) {
      commands.delete(name);
    }
  }

  for (const [file, registered] of loadedFiles.entries()) {
    if (registered === command) {
      loadedFiles.delete(file);
    }
  }
}

function registerCommand(command, fileName = null) {
  if (
    !command?.config ||
    typeof command.onStart !== "function"
  ) {
    throw new Error("Invalid command: config and onStart are required.");
  }

  if (command.config.author !== AUTHOR) {
    throw new Error(
      `Wrong command author: ${command.config.name || fileName || "unknown"}`
    );
  }

  const name = normalize(command.config.name);

  if (!name) {
    throw new Error("Command name is missing.");
  }

  const existing = commands.get(name);

  if (existing && existing !== command) {
    removeCommand(existing);
  }

  commands.set(name, command);

  for (const alias of normalizeAliases(command.config.aliases)) {
    const existingAlias = commands.get(alias);

    if (existingAlias && existingAlias !== command) {
      logger.warn(`Duplicate alias ignored: ${alias}`);
      continue;
    }

    commands.set(alias, command);
  }

  if (fileName) {
    loadedFiles.set(fileName, command);
  }

  return command;
}

function rememberReply(result, command, jid, senderJid) {
  const messageId = result?.key?.id;

  if (!messageId || typeof command.onReply !== "function") {
    return;
  }

  replySessions.set(messageId, {
    command,
    jid,
    senderJid,
    createdAt: Date.now()
  });

  while (replySessions.size > MAX_REPLY_SESSIONS) {
    const oldestId = replySessions.keys().next().value;
    replySessions.delete(oldestId);
  }
}

function findReplySession(context) {
  const messageId = context.quotedMessageId;

  if (!messageId) return null;

  const session = replySessions.get(messageId);

  if (!session) return null;

  if (Date.now() - session.createdAt > REPLY_SESSION_TTL) {
    replySessions.delete(messageId);
    return null;
  }

  if (session.jid !== context.jid) return null;

  return session;
}

function getCooldown(command, senderJid, jid) {
  const config = command.config || {};

  const seconds = Number(
    config.cooldown ??
    config.countDown ??
    config.coolDown ??
    config.cooldowns ??
    0
  );

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return { active: false, remaining: 0 };
  }

  const key = `${config.name}:${senderJid}:${jid}`;
  const lastUsed = cooldowns.get(key) || 0;

  const remaining = Math.ceil(
    (seconds * 1000 - (Date.now() - lastUsed)) / 1000
  );

  return {
    active: remaining > 0,
    remaining: Math.max(0, remaining),
    key
  };
}

function setCooldown(cooldown) {
  if (cooldown?.key) {
    cooldowns.set(cooldown.key, Date.now());
  }
}

function makeCommandContext(context, command, args, name, permission) {
  return {
    ...context,
    args,
    commandName: name,
    permission,
    config: command.config,
    event: context.message,
    message: {
      ...context.message,
      reply: context.reply
    }
  };
}

async function runLifecycleHook(hookName, context) {
  const uniqueCommands = new Set(commands.values());

  for (const command of uniqueCommands) {
    if (typeof command?.[hookName] !== "function") continue;

    try {
      const permission = await checkPermission(
        context,
        command.config || {}
      );

      if (!permission.allowed) continue;

      await command[hookName](
        makeCommandContext(
          context,
          command,
          [],
          command.config.name,
          permission
        )
      );
    } catch (error) {
      logger.error(
        `${hookName} error: ${command.config?.name || "unknown"}`,
        error
      );
    }
  }
}

export async function loadCommandFile(fileName) {
  await fs.ensureDir(CONFIG.COMMAND_DIR);

  let safeName = path.basename(String(fileName || "").trim());

  if (!safeName.endsWith(".js")) {
    safeName += ".js";
  }

  if (!safeName || safeName === ".js") {
    throw new Error("Valid command filename is required.");
  }

  const fullPath = path.join(CONFIG.COMMAND_DIR, safeName);

  if (!(await fs.pathExists(fullPath))) {
    throw new Error(`Command file not found: ${safeName}`);
  }

  const source = await fs.readFile(fullPath, "utf8");

  if (
    CONFIG.AUTHOR_CHECK &&
    !source.includes(`AUTHOR: ${AUTHOR}`)
  ) {
    throw new Error(`Author marker mismatch: ${safeName}`);
  }

  const module = await import(
    `${pathToFileURL(fullPath).href}?v=${Date.now()}`
  );

  const command = module.default;

  registerCommand(command, safeName);

  logger.success(`Loaded command file: ${safeName}`);

  return command;
}

export async function unloadCommandFile(fileName) {
  const requested = path.basename(String(fileName || "").trim());

  let targetFile = requested;

  if (!targetFile.endsWith(".js")) {
    targetFile += ".js";
  }

  let command = loadedFiles.get(targetFile);

  if (!command) {
    command = commands.get(normalize(fileName));
  }

  if (!command) {
    throw new Error(`Command not loaded: ${requested}`);
  }

  const name = command.config?.name || requested;

  removeCommand(command);

  for (const [id, session] of replySessions.entries()) {
    if (session.command === command) {
      replySessions.delete(id);
    }
  }

  logger.info(`Unloaded command: ${name}`);

  return name;
}

export async function loadAllCommandFiles() {
  await fs.ensureDir(CONFIG.COMMAND_DIR);

  const files = (await fs.readdir(CONFIG.COMMAND_DIR))
    .filter(file => file.endsWith(".js"))
    .sort();

  const success = [];
  const failed = [];

  for (const file of files) {
    try {
      await loadCommandFile(file);
      success.push(file);
    } catch (error) {
      failed.push(`${file}: ${error.message}`);
      logger.error(`Failed to load command file: ${file}`, error);
    }
  }

  return { success, failed };
}

export function unloadAllCommandFiles() {
  const count = new Set(commands.values()).size;

  commands.clear();
  loadedFiles.clear();
  replySessions.clear();
  cooldowns.clear();

  logger.info(`Unloaded ${count} commands`);

  return count;
}

export async function loadCommands() {
  commands.clear();
  loadedFiles.clear();
  replySessions.clear();
  cooldowns.clear();

  return loadAllCommandFiles();
}

export async function handleCommand(context) {
  const { body, reply } = context;

  if (!body) return;

  const prefixes = await getPrefixes(context);

  await runLifecycleHook("onAnyEvent", context);
  await runLifecycleHook("onChat", context);

  const firstChatKey = `${context.jid}:${context.senderJid}`;

  if (!firstChats.has(firstChatKey)) {
    firstChats.add(firstChatKey);
    await runLifecycleHook("onFirstChat", context);
  }

  await runLifecycleHook("onEvent", context);

  const replySession = findReplySession(context);

  if (replySession) {
    const command = replySession.command;

    try {
      const permission = await checkPermission(
        context,
        command.config
      );

      if (!permission.allowed) {
        return reply(
          command.config.permissionMessage ||
          permission.message ||
          getLanguageMessage("onlyAdmin")
        );
      }

      const result = await command.onReply({
        ...makeCommandContext(
          context,
          command,
          body.trim().split(/\s+/),
          command.config.name,
          permission
        ),
        Reply: replySession
      });

      rememberReply(
        result,
        command,
        context.jid,
        context.senderJid
      );

      return result;
    } catch (error) {
      handleError(error, `Reply Command: ${command.config.name}`);
      await reply("❌ Reply command চালাতে সমস্যা হয়েছে।");
      return;
    }
  }

  const matchedPrefix = prefixes.find(prefix =>
    body.startsWith(prefix)
  );

  if (!matchedPrefix) {
    const plainParts = body.trim().split(/\s+/);
    const plainName = normalize(plainParts[0]);
    const plainCommand = commands.get(plainName);

    if (
      plainCommand &&
      ["prefix", "pre"].includes(plainName)
    ) {
      const permission = await checkPermission(
        context,
        plainCommand.config
      );

      if (!permission.allowed) {
        return reply(
          plainCommand.config.permissionMessage ||
          permission.message ||
          getLanguageMessage("onlyAdmin")
        );
      }

      try {
        const result = await plainCommand.onStart(
          makeCommandContext(
            context,
            plainCommand,
            plainParts.slice(1),
            plainName,
            permission
          )
        );

        rememberReply(
          result,
          plainCommand,
          context.jid,
          context.senderJid
        );

        return result;
      } catch (error) {
        handleError(error, "Command: prefix");
        await reply("❌ Prefix command চালাতে সমস্যা হয়েছে।");
        return;
      }
    }

    return;
  }

  const input = body.slice(matchedPrefix.length).trim();

  if (!input) {
    return reply(
      getLanguageMessage("onlyPrefix", matchedPrefix)
    );
  }

  const parts = input.split(/\s+/);
  const name = normalize(parts.shift());
  const args = parts;

  const command = commands.get(name);

  if (!command) {
    return reply(
      getLanguageMessage(
        "commandNotFound",
        name,
        matchedPrefix
      )
    );
  }

  const permission = await checkPermission(
    context,
    command.config
  );

  if (!permission.allowed) {
    if (command.config.noPermissionMessage !== false) {
      await reply(
        command.config.permissionMessage ||
        permission.message ||
        getLanguageMessage("onlyAdmin")
      );
    }

    return;
  }

  const cooldown = getCooldown(
    command,
    context.senderJid,
    context.jid
  );

  if (cooldown.active) {
    return reply(
      `⏳ এই কমান্ডটি আবার ব্যবহার করতে ${cooldown.remaining} সেকেন্ড অপেক্ষা করো।`
    );
  }

  try {
    setCooldown(cooldown);

    const result = await command.onStart(
      makeCommandContext(
        context,
        command,
        args,
        name,
        permission
      )
    );

    rememberReply(
      result,
      command,
      context.jid,
      context.senderJid
    );

    return result;
  } catch (error) {
    handleError(error, `Command: ${name}`);
    await reply("❌ কমান্ড চালাতে সমস্যা হয়েছে।");
  }
}

export function getCommands() {
  return commands;
}

export function getCommand(name) {
  return commands.get(normalize(name)) || null;
}

export default {
  loadCommands,
  loadCommandFile,
  unloadCommandFile,
  loadAllCommandFiles,
  unloadAllCommandFiles,
  handleCommand,
  getCommands,
  getCommand
};
