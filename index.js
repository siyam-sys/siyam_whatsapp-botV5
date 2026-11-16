
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে।

import fs from "fs-extra";

import { CONFIG } from "./config.js";
import { createLogger } from "./system/logger.js";
import { validateAuthor } from "./scripts/authorGuard.js";
import { printWatchdog } from "./system/watchdog.js";

import { connectToWhatsApp } from "./core/connection.js";
import { loadCommands } from "./core/commandHandler.js";
import { handleMessages } from "./core/messageHandler.js";
import { loadEvents, attachEvents } from "./core/eventHandler.js";
import { installErrorHandlers } from "./core/errorHandler.js";

import { DisconnectReason } from "@whiskeysockets/baileys";

const logger = createLogger();

const BASE_RECONNECT_DELAY = 5000;
const MAX_RECONNECT_DELAY = 60000;

let currentSocket = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
let isStopping = false;
let isStarting = false;

async function prepareDirectories() {
  const dirs = [
    CONFIG.SESSION_DIR,
    CONFIG.COMMAND_DIR,
    CONFIG.EVENT_DIR,
    CONFIG.DATABASE?.DIRECTORY
  ].filter(Boolean);

  await Promise.all(
    dirs.map(dir => fs.ensureDir(dir))
  );
}

async function startBot() {
  if (isStopping || isStarting) return;

  isStarting = true;

  try {
    await prepareDirectories();

    logger.info(`Starting ${CONFIG.BOT_NAME}`);

    if (CONFIG.AUTHOR_CHECK) {
      await validateAuthor();
    }

    const commands = await loadCommands();
    const events = await loadEvents();

    logger.success(`Loaded ${commands.size} commands`);
    logger.success(`Loaded ${events.size} events`);

    const sock = await connectToWhatsApp();

    currentSocket = sock;

    handleMessages(sock);
    attachEvents(sock);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
      if (connection === "open") {
        reconnectAttempts = 0;

        logger.success("WhatsApp connected successfully");
        logger.success(CONFIG.BOT_NAME);

        printWatchdog();
      }

      if (connection === "close") {
        currentSocket = null;

        const statusCode =
          lastDisconnect?.error?.output?.statusCode;

        logger.warn(
          `Connection closed. Status: ${statusCode ?? "unknown"}`
        );

        if (statusCode === DisconnectReason.loggedOut) {
          logger.error(
            "WhatsApp session logged out. Relink the account."
          );

          isStopping = true;
          return;
        }

        if (
          statusCode === DisconnectReason.restartRequired ||
          statusCode === 515
        ) {
          scheduleReconnect(1500);
        } else {
          scheduleReconnect();
        }
      }
    });

  } catch (error) {
    logger.error("Bot startup failed", error);
    scheduleReconnect();

  } finally {
    isStarting = false;
  }
}

function scheduleReconnect(customDelay) {
  if (isStopping || reconnectTimer) return;

  reconnectAttempts++;

  const backoff = Math.min(
    BASE_RECONNECT_DELAY *
      (2 ** Math.min(reconnectAttempts - 1, 4)),
    MAX_RECONNECT_DELAY
  );

  const delay = Number.isFinite(customDelay)
    ? customDelay
    : backoff;

  logger.warn(
    `Reconnecting in ${Math.ceil(delay / 1000)} seconds`
  );

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await startBot();
  }, delay);
}

installErrorHandlers(logger);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function shutdown() {
  if (isStopping) return;

  isStopping = true;

  logger.warn("Stopping bot...");

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  try {
    currentSocket?.end?.(
      new Error("Bot shutdown")
    );
  } catch (error) {
    logger.error("Shutdown error", error);
  }

  logger.success("Bot stopped");
  process.exit(0);
}

startBot();
