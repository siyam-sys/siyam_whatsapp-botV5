
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

export const AUTHOR = "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦";

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

export const normalizeNumber = (number = "") => {
  let value = String(number)
    .split("@")[0]
    .split(":")[0]
    .replace(/\D/g, "");

  if (value.startsWith("0")) {
    value = "88" + value;
  }

  return value;
};

const list = (value = "") =>
  value
    .split(",")
    .map(normalizeNumber)
    .filter(Boolean);

const OWNER_NUMBER = normalizeNumber(
  process.env.OWNER_NUMBER || "01789138157"
);

const BOT_NUMBER = normalizeNumber(
  process.env.BOT_PHONE_NUMBER || "01608279461"
);

const BOT_ADMIN_NUMBERS = [
  OWNER_NUMBER,
  ...list(process.env.BOT_ADMINS || "")
];

const UNIQUE_BOT_ADMINS = [
  ...new Set(BOT_ADMIN_NUMBERS.filter(Boolean))
];

const WHITELIST_NUMBERS = list(
  process.env.WHITELIST || ""
);

export const CONFIG = Object.freeze({
  BOT_NAME: "RJ-siyam whatsapp-botV5",
  AUTHOR,
  VERSION: "5.0.0",

  ROOT_DIR,

  PREFIX: process.env.BOT_PREFIX || ",",

  BOT_PHONE_NUMBER: BOT_NUMBER,

  OWNER_NUMBER,
  OWNER: OWNER_NUMBER,
  OWNER_ID: `${OWNER_NUMBER}@s.whatsapp.net`,

  BOT_ADMINS: UNIQUE_BOT_ADMINS,

  BOT_ADMIN_IDS: UNIQUE_BOT_ADMINS.map(
    number => `${number}@s.whatsapp.net`
  ),

  WHITELIST: WHITELIST_NUMBERS,
  WHITELIST_IDS: WHITELIST_NUMBERS.map(
    number => `${number}@s.whatsapp.net`
  ),

  SESSION_DIR: path.join(ROOT_DIR, "session"),
  COMMAND_DIR: path.join(ROOT_DIR, "scripts", "cmds"),
  EVENT_DIR: path.join(ROOT_DIR, "scripts", "events"),
  DATABASE_DIR: path.join(ROOT_DIR, "database"),

  DATABASE: Object.freeze({
    DIRECTORY: path.join(ROOT_DIR, "database"),
    USERS_FILE: path.join(ROOT_DIR, "database", "users.json"),
    GROUPS_FILE: path.join(ROOT_DIR, "database", "groups.json"),
    WHITELIST_FILE: path.join(ROOT_DIR, "database", "whitelist.json")
  }),

  ALLOW_GROUP: true,
  ALLOW_INBOX: true,

  MESSAGE_MODE: process.env.MESSAGE_MODE || "all",
  DEFAULT_MODE: "all",

  MODES: Object.freeze([
    "all",
    "adminOnly",
    "whiteListMode",
    "ownerOnly"
  ]),

  PAIRING: Object.freeze({
    ENABLED: true,
    PHONE_NUMBER: BOT_NUMBER,
    CODE_LENGTH: 8,
    SHOW_PHONE_NUMBER: true
  }),

  RECONNECT_DELAY: 5000,
  MAX_RECONNECT_DELAY: 60000,

  AUTHOR_CHECK: process.env.AUTHOR_CHECK === "true",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  LOGGING: Object.freeze({
    SHOW_PAIRING_CODE: true,
    SHOW_CONNECTION_STATUS: true,
    SHOW_PHONE_NUMBER: true
  })
});

export const isOwner = (jid = "") => {
  const number = normalizeNumber(jid);

  return Boolean(
    number && number === OWNER_NUMBER
  );
};

export const isBotAdmin = (jid = "") => {
  const number = normalizeNumber(jid);

  return Boolean(
    number && (
      UNIQUE_BOT_ADMINS.includes(number) ||
      isOwner(jid)
    )
  );
};

export const getPhoneNumber = () => BOT_NUMBER;
