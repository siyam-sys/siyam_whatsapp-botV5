
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

export const AUTHOR = "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦";
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

//owner 
const OWNER_NUMBER = normalizeNumber("01789138157");


const ROLE_UIDS = {
  GROUP_ADMIN: [15518304043117],

  BOT_ADMIN: [15518304043117],

  OWNER: [
    
  ]
};

// Whitelist UID
const WHITELIST_UIDS = [15518304043117];

export function normalizeNumber(number = "") {
  let value = String(number)
    .split("@")[0]
    .split(":")[0]
    .replace(/\D/g, "");

  if (value.startsWith("0")) {
    value = "88" + value;
  }

  return value;
}

export function normalizeWhatsAppId(id = "") {
  let value = String(id || "").trim().toLowerCase();

  if (!value) return "";

  if (value.includes("@lid")) {
    return value.split(":")[0];
  }

  if (value.includes("@s.whatsapp.net")) {
    return normalizeNumber(value) + "@s.whatsapp.net";
  }

  if (value.includes("@")) {
    return value;
  }

  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  
  if (digits.startsWith("0") || digits.startsWith("88")) {
    return normalizeNumber(digits) + "@s.whatsapp.net";
  }

  return digits + "@lid";
}

const normalizeList = list =>
  [...new Set((list || []).map(normalizeWhatsAppId).filter(Boolean))];

const OWNER_ID = OWNER_NUMBER + "@s.whatsapp.net";
const BOT_NUMBER = normalizeNumber(
  process.env.BOT_PHONE_NUMBER || "01608279461"
);

const BOT_ADMINS = normalizeList([
  OWNER_ID,
  ...(process.env.BOT_ADMINS || "").split(","),
  ...ROLE_UIDS.BOT_ADMIN
]);

const WHITELIST = normalizeList([
  ...WHITELIST_UIDS,
  ...(process.env.WHITELIST || "").split(",")
]);

export function isOwner(...ids) {
  return ids.flat().some(id => {
    const value = String(id || "").trim();

    if (!value) return false;

    return normalizeNumber(value) === OWNER_NUMBER;
  });
}

export function getConfiguredRole(...ids) {
  const candidates = normalizeList(ids.flat());

  if (isOwner(...ids)) return 3;

  if (normalizeList(ROLE_UIDS.OWNER).some(id => candidates.includes(id))) {
    return 3;
  }

  if (normalizeList(ROLE_UIDS.BOT_ADMIN).some(id => candidates.includes(id))) {
    return 2;
  }

  if (normalizeList(ROLE_UIDS.GROUP_ADMIN).some(id => candidates.includes(id))) {
    return 1;
  }

  return 0;
}

export function isBotAdmin(...ids) {
  return isOwner(...ids) || getConfiguredRole(...ids) >= 2;
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
  OWNER: OWNER_NUMBER,
  OWNER_ID,

  BOT_ADMINS,

  BOT_ADMIN_IDS: BOT_ADMINS.map(id =>
    id.includes("@") ? id : id + "@s.whatsapp.net"
  ),

  WHITELIST,
  WHITELIST_IDS: WHITELIST,

  ROLE_UIDS,

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
