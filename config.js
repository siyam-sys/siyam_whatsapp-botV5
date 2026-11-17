
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

export const AUTHOR = "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦";
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

// Owner number: OWNER_NUMBER can be configured in Railway Variables.
export const MAIN_OWNER =
  process.env.OWNER_NUMBER || "01789138157";

// Role 1: Group Admin
export const GROUP_ADMIN_IDS = [
  "15518304043117"
];

// Role 2: Bot Admin
export const BOT_ADMIN_IDS = [
  "15518304043117"
];

// Whitelist
export const WHITELIST_IDS = [
  "15518304043117"
];

export function normalizeNumber(value = "") {
  let number = String(value)
    .split("@")[0]
    .split(":")[0]
    .replace(/\D/g, "");

  if (number.startsWith("0")) {
    number = "88" + number;
  }

  return number;
}

export function normalizeWhatsAppId(id = "") {
  const value = String(id || "").trim().toLowerCase();

  if (!value) return "";

  if (value.includes("@lid")) {
    return value.split(":")[0];
  }

  if (value.includes("@s.whatsapp.net")) {
    return normalizeNumber(value) + "@s.whatsapp.net";
  }

  if (value.includes("@")) return value;

  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("0") || digits.startsWith("88")) {
    return normalizeNumber(digits) + "@s.whatsapp.net";
  }

  return digits + "@lid";
}

const normalizeList = list =>
  [...new Set(
    (list || [])
      .map(normalizeWhatsAppId)
      .filter(Boolean)
  )];

// Require an explicitly configured bot number.
// No fallback to an unrelated phone number.
const rawBotNumber = process.env.BOT_PHONE_NUMBER;

if (!rawBotNumber) {
  throw new Error(
    "BOT_PHONE_NUMBER is missing. Set it in Railway Variables."
  );
}

const BOT_NUMBER = normalizeNumber(rawBotNumber);

if (!/^8801[3-9]\d{8}$/.test(BOT_NUMBER)) {
  throw new Error(
    "BOT_PHONE_NUMBER is invalid. Use Bangladesh number with country code, e.g. 8801780127593."
  );
}

const MAIN_OWNER_ID = normalizeWhatsAppId(MAIN_OWNER);

const OWNER_NUMBER = MAIN_OWNER_ID.endsWith("@s.whatsapp.net")
  ? normalizeNumber(MAIN_OWNER_ID)
  : "";

const OWNER_ID = MAIN_OWNER_ID;

const GROUP_ADMINS = normalizeList(GROUP_ADMIN_IDS);

const BOT_ADMINS = normalizeList([
  MAIN_OWNER_ID,
  ...BOT_ADMIN_IDS,
  ...(process.env.BOT_ADMINS || "").split(",")
]);

const WHITELIST = normalizeList([
  ...WHITELIST_IDS,
  ...(process.env.WHITELIST || "").split(",")
]);

export function isOwner(...ids) {
  const candidates = normalizeList(ids.flat());
  return candidates.includes(MAIN_OWNER_ID);
}

export function getConfiguredRole(...ids) {
  const candidates = normalizeList(ids.flat());

  if (isOwner(...ids)) return 2;

  if (BOT_ADMINS.some(id => candidates.includes(id))) {
    return 2;
  }

  if (GROUP_ADMINS.some(id => candidates.includes(id))) {
    return 1;
  }

  return 0;
}

export function isBotAdmin(...ids) {
  return getConfiguredRole(...ids) >= 2;
}

export function isWhitelisted(...ids) {
  const candidates = normalizeList(ids.flat());

  return WHITELIST.some(id => candidates.includes(id));
}

export const CONFIG = Object.freeze({
  BOT_NAME: "RJ-siyam whatsapp-botV5",
  AUTHOR,
  VERSION: "5.0.0",
  ROOT_DIR,

  PREFIX: process.env.BOT_PREFIX || ",",

  BOT_PHONE_NUMBER: BOT_NUMBER,

  OWNER_NUMBER,
  OWNER: OWNER_NUMBER || OWNER_ID,
  OWNER_ID,

  BOT_ADMINS,
  BOT_ADMIN_IDS: BOT_ADMINS,

  GROUP_ADMINS,
  WHITELIST,
  WHITELIST_IDS: WHITELIST,

  ROLE_UIDS: Object.freeze({
    GROUP_ADMIN: GROUP_ADMINS,
    BOT_ADMIN: BOT_ADMINS
  }),

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

export const getPhoneNumber = () => BOT_NUMBER;
