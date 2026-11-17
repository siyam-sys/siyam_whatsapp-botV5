// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";

import { CONFIG, AUTHOR } from "../config.js";
import { createLogger } from "../system/logger.js";

const logger = createLogger();

const events = new Map();
const attachedListeners = new WeakMap();

function normalizeEventName(value) {
  return String(value ?? "").trim();
}

function getEventNames(event) {
  const configured = event?.config?.event;

  if (Array.isArray(configured)) {
    return configured
      .map(normalizeEventName)
      .filter(Boolean);
  }

  const name = normalizeEventName(configured);

  return name ? [name] : [];
}

export async function loadEvents() {
  events.clear();

  await fs.ensureDir(CONFIG.EVENT_DIR);

  const files = await fs.readdir(CONFIG.EVENT_DIR);

  for (const file of files.sort()) {
    if (!file.endsWith(".js")) continue;

    const fullPath = path.join(CONFIG.EVENT_DIR, file);

    try {
      const source = await fs.readFile(fullPath, "utf8");

      if (
        CONFIG.AUTHOR_CHECK &&
        !source.includes(`AUTHOR: ${AUTHOR}`)
      ) {
        logger.warn(`Event disabled: author marker mismatch: ${file}`);
        continue;
      }

      const module = await import(
        `${pathToFileURL(fullPath).href}?v=${Date.now()}`
      );

      const event = module.default;

      if (
        !event?.config ||
        typeof event.onStart !== "function"
      ) {
        logger.warn(`Invalid event disabled: ${file}`);
        continue;
      }

      if (event.config.author !== AUTHOR) {
        logger.warn(`Event disabled: wrong author: ${file}`);
        continue;
      }

      const eventNames = getEventNames(event);

      if (!eventNames.length) {
        logger.warn(`Event disabled: missing event name: ${file}`);
        continue;
      }

      event.__file = file;

      for (const eventName of eventNames) {
        if (!events.has(eventName)) {
          events.set(eventName, []);
        }

        events.get(eventName).push(event);
      }

      logger.success(`Loaded event: ${event.config.name || file}`);
    } catch (error) {
      logger.error(`Failed to load event: ${file}`, error);
    }
  }

  return events;
}

export function detachEvents(sock) {
  if (!sock?.ev) return;

  const listeners = attachedListeners.get(sock);

  if (!listeners) return;

  for (const [eventName, listener] of listeners) {
    try {
      sock.ev.off(eventName, listener);
    } catch (error) {
      logger.warn(`Could not detach event listener: ${eventName}`);
    }
  }

  attachedListeners.delete(sock);
}

export function attachEvents(sock) {
  if (!sock?.ev) {
    throw new Error("Invalid WhatsApp socket passed to attachEvents()");
  }

  // একই socket-এ duplicate listener আটকানো।
  detachEvents(sock);

  const listeners = [];

  for (const [eventName, handlers] of events.entries()) {
    const listener = async data => {
      for (const event of handlers) {
        try {
          await event.onStart({
            sock,
            data,
            eventName,
            config: event.config
          });
        } catch (error) {
          logger.error(
            `Event error: ${event.config?.name || event.__file || eventName}`,
            error
          );
        }
      }
    };

    sock.ev.on(eventName, listener);

    listeners.push([eventName, listener]);
  }

  attachedListeners.set(sock, listeners);

  logger.success(
    `Attached ${listeners.length} WhatsApp event listeners`
  );

  return listeners.length;
}

export function getEvents() {
  return events;
}

export default {
  loadEvents,
  attachEvents,
  detachEvents,
  getEvents
};
