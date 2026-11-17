
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

const MAX_REPLY_SESSIONS = 500;
const REPLY_SESSION_TTL = 24 * 60 * 60 * 1000;

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
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
  } catch {
    // Use configured prefix.
  }

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

      await command[hookName]({
        ...context,
        args: [],
        commandName: command.config.name,
        permission,
        config: command.config,
        event: context.message,
        message: {
          ...context.message,
          reply: context.reply
        }
      });
    } catch (error) {
      logger.error(
        `${hookName} error: ${command.config?.name || "unknown"}`,
        error
      );
    }
  }
}

export async function loadCommands() {
  commands.clear();
  replySessions.clear();

  await fs.ensureDir(CONFIG.COMMAND_DIR);

  const files = await fs.readdir(CONFIG.COMMAND_DIR);

  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    const fullPath = path.join(CONFIG.COMMAND_DIR, file);

    try {
      const source = await fs.readFile(fullPath, "utf8");

      if (
        CONFIG.AUTHOR_CHECK &&
        !source.includes(`AUTHOR: ${AUTHOR}`)
      ) {
        logger.warn(`Command disabled: author marker mismatch: ${file}`);
        continue;
      }

      const module = await import(
        pathToFileURL(fullPath).href + `?v=${Date.now()}`
      );

      const command = module.default;

      if (!command?.config || typeof command.onStart !== "function") {
        logger.warn(`Invalid command disabled: ${file}`);
        continue;
      }

      if (command.config.author !== AUTHOR) {
        logger.warn(`Command disabled: wrong author: ${file}`);
        continue;
      }

      const name = normalize(command.config.name);

      if (!name) {
        logger.warn(`Command disabled: missing name: ${file}`);
        continue;
      }

      commands.set(name, command);

      for (const alias of command.config.aliases || []) {
        commands.set(normalize(alias), command);
      }

      logger.success(`Loaded command: ${name}`);
    } catch (error) {
      logger.error(`Failed to load command: ${file}`, error);
    }
  }

  return commands;
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
          getLanguageMessage("onlyAdmin")
        );
      }

      const result = await command.onReply({
        ...context,
        args: body.trim().split(/\s+/),
        commandName: command.config.name,
        config: command.config,
        permission,
        Reply: replySession
      });

      rememberReply(
        result,
        command,
        context.jid,
        context.senderJid
      );
    } catch (error) {
      handleError(error, `Reply Command: ${command.config.name}`);
      await reply("❌ রিপ্লাই প্রসেস করতে সমস্যা হয়েছে।");
    }

    return;
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
          "🚫 𝗢𝗻𝗹𝘆 𝗠𝘆 𝗕𝗼𝘀𝘀 𝐒𝐈𝐘𝐀𝐌 আগে লেভেলে আয়🌚 সর এখান থেকে🙄🐸।"
        );
      }

      try {
        const result = await plainCommand.onStart({
          ...context,
          args: plainParts.slice(1),
          commandName: plainName,
          permission,
          config: plainCommand.config
        });

        rememberReply(
          result,
          plainCommand,
          context.jid,
          context.senderJid
        );

        return result;
      } catch (error) {
        handleError(error, "Command: prefix");
        return reply("❌ Prefix কমান্ড চালাতে সমস্যা হয়েছে।");
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
        "🚫 𝗢𝗻𝗹𝘆 𝗠𝘆 𝗕𝗼𝘀𝘀 𝐒𝐈𝐘𝐀𝐌 তুই আবাল 🌚 সর এখান থেকে🙄🐸"
      );
    }

    return;
  }

  try {
    const result = await command.onStart({
      ...context,
      args,
      commandName: name,
      permission,
      config: command.config
    });

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
