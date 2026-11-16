
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে।

import "dotenv/config";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

import { AUTHOR, CONFIG } from "./config.js";
import { createLogger } from "./system/logger.js";
import { validateAuthor } from "./scripts/authorGuard.js";
import { printWatchdog } from "./system/watchdog.js";
import { connectToWhatsApp } from "./core/connection.js";
import { loadCommands } from "./core/commandHandler.js";
import { handleMessages } from "./core/messageHandler.js";
import { loadEvents, attachEvents } from "./core/eventHandler.js";
import { installErrorHandlers } from "./core/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger();

let sock = null;
let isStarting = false;
let reconnectTimer = null;
let reconnectAttempts = 0;
let isShuttingDown = false;

const directories = [
  CONFIG.SESSION_DIR || "./session",
  CONFIG.COMMAND_DIR || "./scripts/cmds",
  CONFIG.EVENT_DIR || "./scripts/events",
  CONFIG.DATABASE?.DIRECTORY || "./database",
  "./logs"
];

async function prepareDirectories() {
  for (const directory of directories) {
    if (!directory || typeof directory !== "string") {
      throw new Error(`Invalid directory path: ${directory}`);
    }

    await fs.ensureDir(path.resolve(__dirname, directory));
  }

  await fs.ensureFile(
    path.resolve(__dirname, "database/users.json")
  );

  await fs.ensureFile(
    path.resolve(__dirname, "database/groups.json")
  );
}

async function startBot() {
  if (isStarting || isShuttingDown) return;

  isStarting = true;

  try {
    logger.info(`Starting ${CONFIG.BOT_NAME}`);

    await prepareDirectories();

    const authorResult = await validateAuthor();

    if (authorResult === false) {
      throw new Error("Author integrity validation failed.");
    }

    logger.success("Author integrity check completed");

    const commands = await loadCommands();
    logger.success(`Loaded ${commands?.size || 0} commands`);

    const events = await loadEvents();
    logger.success(`Loaded ${events?.length || 0} events`);

    sock = await connectToWhatsApp();

    if (!sock) {
      throw new Error("WhatsApp socket creation failed");
    }

    handleMessages(sock);
    attachEvents(sock, events);

    reconnectAttempts = 0;

    logger.success("WhatsApp event listeners attached");
  } catch (error) {
    logger.error("Bot startup failed", error);
    scheduleReconnect();
  } finally {
    isStarting = false;
  }
}

function scheduleReconnect() {
  if (isShuttingDown || reconnectTimer) return;

  reconnectAttempts++;

  const delay = Math.min(
    5000 * Math.pow(2, reconnectAttempts - 1),
    60000
  );

  logger.warn(
    `Reconnecting in ${Math.round(delay / 1000)} seconds`
  );

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startBot().catch(error =>
      logger.error("Reconnect failed", error)
    );
  }, delay);
}

function installConnectionHandler(socket) {
  socket.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      reconnectAttempts = 0;

      logger.success(
        `WhatsApp connected: ${socket.user?.id || "Connected"}`
      );
    }

    if (connection === "close") {
      const status =
        lastDisconnect?.error?.output?.statusCode;

      logger.warn(`WhatsApp disconnected. Status: ${status}`);

      if (isShuttingDown) return;

      if (status === 401 || status === 403) {
        logger.error(
          "WhatsApp session logged out. Manual relinking required."
        );
        return;
      }

      scheduleReconnect();
    }
  });
}

async function boot() {
  installErrorHandlers(logger);
  printWatchdog();

  await prepareDirectories();

  const originalConnect = connectToWhatsApp;

  await startBot();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function shutdown() {
  if (isShuttingDown) return;

  isShuttingDown = true;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  try {
    if (sock) {
      sock.end(new Error("Bot shutting down"));
    }
  } catch (error) {
    logger.error("Shutdown error", error);
  }

  process.exit(0);
}

boot().catch(error => {
  logger.error("Fatal startup error", error);
  process.exitCode = 1;
});
