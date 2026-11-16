
import "dotenv/config";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WARNING: AUTHOR পরিবর্তন করলে এই ফাইল Disable হবে।

export const AUTHOR = "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦";

const normalizeNumber = (number = "") => {
  let value = String(number).replace(/\D/g, "");

  if (value.startsWith("0")) {
    value = "88" + value;
  }

  return value;
};

const list = (value = "") =>
  value
    .split(",")
    .map(v => normalizeNumber(v))
    .filter(Boolean);

const BOT_NUMBER = normalizeNumber(
  process.env.BOT_PHONE_NUMBER || "01608279461"
);

// আলাদা Owner চাইলে .env-এ OWNER_NUMBER দিতে পারবে।
const OWNER_NUMBER = normalizeNumber(
  process.env.OWNER_NUMBER || ""
);

// Main Bot Admin
const BOT_ADMIN_NUMBERS = [
  "01789138157",
  ...list(process.env.BOT_ADMINS || "")
].filter((number, index, array) =>
  number && array.indexOf(number) === index
);

const WHITELIST_NUMBERS = list(
  process.env.WHITELIST || ""
);

export const CONFIG = Object.freeze({
  BOT_NAME: "RJ-siyam whatsapp-botV5",
  AUTHOR,

  VERSION: "5.0.0",
  PREFIX: "/",

  // WhatsApp Numbers
  BOT_PHONE_NUMBER: BOT_NUMBER,
  OWNER_NUMBER,

  OWNER: OWNER_NUMBER,
  OWNER_ID: OWNER_NUMBER
    ? `${OWNER_NUMBER}@s.whatsapp.net`
    : "",

  // Bot Admin Permissions
  BOT_ADMINS: BOT_ADMIN_NUMBERS,
  BOT_ADMIN_IDS: BOT_ADMIN_NUMBERS.map(
    number => `${number}@s.whatsapp.net`
  ),

  // Compatibility
  WHITELIST: WHITELIST_NUMBERS,
  WHITELIST_IDS: WHITELIST_NUMBERS,

  // Directories
  SESSION_DIR: "./session",
  COMMAND_DIR: "./scripts/cmds",
  EVENT_DIR: "./scripts/events",
  DATABASE_DIR: "./database",

  DATABASE: Object.freeze({
    DIRECTORY: "./database",
    USERS_FILE: "./database/users.json",
    GROUPS_FILE: "./database/groups.json"
  }),

  // Message Settings
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

  // Pairing Settings
  PAIRING: Object.freeze({
    ENABLED: true,
    PHONE_NUMBER: BOT_NUMBER,
    CODE_LENGTH: 8,
    SHOW_PHONE_NUMBER: true
  }),

  // Reconnection Settings
  RECONNECT_DELAY: 5000,
  MAX_RECONNECT_DELAY: 60000,

  // Optional Settings
  AUTHOR_CHECK: process.env.AUTHOR_CHECK === "true",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  // Logging
  LOGGING: Object.freeze({
    SHOW_PAIRING_CODE: true,
    SHOW_CONNECTION_STATUS: true,
    SHOW_PHONE_NUMBER: true
  })
});

// Owner Check
export const isOwner = (jid = "") => {
  const number = normalizeNumber(
    String(jid).split("@")[0].split(":")[0]
  );

  return Boolean(
    OWNER_NUMBER && number === OWNER_NUMBER
  );
};

// Bot Admin Check
export const isBotAdmin = (jid = "") => {
  const number = normalizeNumber(
    String(jid).split("@")[0].split(":")[0]
  );

  return (
    BOT_ADMIN_NUMBERS.includes(number) ||
    isOwner(jid)
  );
};

// Get Bot Phone Number
export const getPhoneNumber = () => BOT_NUMBER;
