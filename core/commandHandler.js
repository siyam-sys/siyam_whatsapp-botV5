
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";

import { CONFIG, AUTHOR } from "../config.js";
import { checkPermission } from "./permission.js";
import { COMMAND_CONFIG } from "../configCommands.js";
import { handleError } from "./errorHandler.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

const commands = new Map();

// Stores messages sent by commands that support onReply.
const replySessions = new Map();

const MAX_REPLY_SESSIONS = 500;
const REPLY_SESSION_TTL = 24 * 60 * 60 * 1000;

function rememberReply(result, command, jid) {
  const messageId = result?.key?.id;

  if (!messageId || typeof command.onReply !== "function") {
    return;
  }

  replySessions.set(messageId, {
    command,
    jid,
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

  // Only accept the reply in the same chat where the bot answered.
  if (session.jid !== context.jid) {
    return null;
  }

  return session;
}

function hasAuthorMarker(source) {
  return source.includes(`AUTHOR: ${AUTHOR}`);
}

export async function loadCommands() {
  commands.clear();
  replySessions.clear();

  await fs.ensureDir(CONFIG.COMMAND_DIR);

  const files = await fs.readdir(CONFIG.COMMAND_DIR);

  for (const file of files) {
    if (!file.endsWith(COMMAND_CONFIG.commandExtension)) continue;

    const fullPath = path.join(CONFIG.COMMAND_DIR, file);

    try {
      const source = await fs.readFile(fullPath, "utf8");

      if (CONFIG.AUTHOR_CHECK && !hasAuthorMarker(source)) {
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

      const name = String(command.config.name || "").toLowerCase();

      if (!name) {
        logger.warn(`Command disabled: missing name: ${file}`);
        continue;
      }

      commands.set(name, command);

      for (const alias of command.config.aliases || []) {
        commands.set(String(alias).toLowerCase(), command);
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

  // First check whether this message replies to a bot response.
  const replySession = findReplySession(context);

  if (replySession) {
    const command = replySession.command;

    try {
      const result = await command.onReply(context);

      // Register the new bot response so the conversation can continue.
      rememberReply(result, command, context.jid);

    } catch (error) {
      handleError(error, `Reply Command: ${command.config.name}`);
      await reply("❌ রিপ্লাই প্রসেস করতে সমস্যা হয়েছে।");
    }

    return;
  }

  // Normal prefix command handling.
  if (!body.startsWith(CONFIG.PREFIX)) return;

  const input = body.slice(CONFIG.PREFIX.length).trim();

  if (!input) return;

  const parts = input.split(/\s+/);
  const name = parts.shift().toLowerCase();
  const args = parts;

  const command = commands.get(name);

  if (!command) return;

  const permission = await checkPermission(
    context,
    command.config
  );

  if (!permission.allowed) {
    if (command.config.noPermissionMessage !== false) {
      await reply(
        command.config.permissionMessage ||
        "❌ এই কমান্ড ব্যবহারের অনুমতি তোমার নেই।"
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

    // Save the bot's sent message ID for future quoted replies.
    rememberReply(result, command, context.jid);

  } catch (error) {
    handleError(error, `Command: ${name}`);
    await reply("❌ কমান্ড চালাতে সমস্যা হয়েছে।");
  }
}

export function getCommands() {
  return commands;
}
