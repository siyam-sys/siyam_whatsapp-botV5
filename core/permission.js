// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import fs from "fs-extra";
import {
  CONFIG,
  isOwner,
  isBotAdmin,
  isWhitelisted,
  normalizeWhatsAppId,
  getConfiguredRole
} from "../config.js";

import { COMMAND_CONFIG } from "../configCommands.js";

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function roleNumber(value) {
  if (typeof value === "number") {
    return Math.max(0, Math.min(2, value));
  }

  const roles = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 2,
    user: 0,
    member: 0,
    group_admin: 1,
    admin: 1,
    bot_admin: 2,
    box_admin: 2,
    owner: 2,
    main_owner: 2
  };

  return roles[normalize(value)] ?? -1;
}

async function getWhitelist() {
  const file = CONFIG.DATABASE.WHITELIST_FILE;

  try {
    if (!(await fs.pathExists(file))) {
      return {
        enabled: false,
        ids: [...CONFIG.WHITELIST_IDS]
      };
    }

    const data = await fs.readJson(file);

    return {
      enabled: Boolean(data.enabled),
      ids: Array.isArray(data.ids)
        ? data.ids.map(normalizeWhatsAppId).filter(Boolean)
        : [...CONFIG.WHITELIST_IDS]
    };
  } catch {
    return {
      enabled: false,
      ids: [...CONFIG.WHITELIST_IDS]
    };
  }
}

function sameIdentity(first, second) {
  const a = normalizeWhatsAppId(first);
  const b = normalizeWhatsAppId(second);

  return Boolean(a && b && a === b);
}

function includesIdentity(list, identities) {
  return list.some(id =>
    identities.some(sender => sameIdentity(id, sender))
  );
}

async function isGroupAdmin(context, identities) {
  if (!context.isGroup || !context.sock || !context.jid) {
    return false;
  }

  try {
    const metadata = await context.sock.groupMetadata(context.jid);

    return (metadata.participants || []).some(participant => {
      const participantIds = [
        participant.id,
        participant.lid,
        participant.phoneNumber
      ].filter(Boolean);

      const matched = participantIds.some(id =>
        identities.some(sender => sameIdentity(id, sender))
      );

      return matched &&
        ["admin", "superadmin"].includes(participant.admin);
    });
  } catch {
    return false;
  }
}

export async function checkPermission(context, commandConfig = {}) {
  const identities = [
    context.senderJid,
    context.senderUid,
    context.senderAltJid
  ].filter(Boolean);

  const owner = isOwner(...identities);
  const botAdmin = owner || isBotAdmin(...identities);
  const groupAdmin = await isGroupAdmin(context, identities);

  let roleLevel = getConfiguredRole(...identities);

  if (groupAdmin && roleLevel < 1) {
    roleLevel = 1;
  }

  if (owner) roleLevel = 2;

  const role = owner
    ? "OWNER"
    : botAdmin
      ? "BOT_ADMIN"
      : groupAdmin
        ? "GROUP_ADMIN"
        : "USER";

  const whitelist = await getWhitelist();

  const whitelisted =
    isWhitelisted(...identities) ||
    includesIdentity(whitelist.ids, identities);

  const deny = (reason, message) => ({
    allowed: false,
    role,
    roleLevel,
    owner,
    botAdmin,
    groupAdmin,
    whitelisted,
    reason,
    message
  });

  const allow = reason => ({
    allowed: true,
    role,
    roleLevel,
    owner,
    botAdmin,
    groupAdmin,
    whitelisted,
    reason
  });

  // Main owner is never blocked by command restrictions.
  if (owner) {
    return allow("Main Owner");
  }

  // Group-only / inbox-only restrictions.
  if (
    commandConfig.groupOnly === true ||
    commandConfig.onlyGroup === true
  ) {
    if (!context.isGroup) {
      return deny("Group only", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
    }
  }

  if (
    commandConfig.inboxOnly === true ||
    commandConfig.onlyInbox === true
  ) {
    if (context.isGroup) {
      return deny("Inbox only", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
    }
  }

  // Main-owner-only command.
  if (
    commandConfig.ownerOnly === true ||
    commandConfig.onlyOwner === true ||
    commandConfig.mainOwnerOnly === true
  ) {
    return deny("Main Owner only", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
  }

  // Bot admin / box admin restriction.
  if (
    commandConfig.botAdminOnly === true ||
    commandConfig.boxAdminOnly === true ||
    commandConfig.onlyBotAdmin === true ||
    commandConfig.onlyAdminBot === true ||
    commandConfig.onlyAdminBox === true
  ) {
    if (!botAdmin) {
      return deny("Bot Admin only", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
    }
  }

  // Group admin restriction.
  if (
    commandConfig.adminOnly === true ||
    commandConfig.groupAdminOnly === true ||
    commandConfig.onlyGroupAdmin === true ||
    commandConfig.onlyAdmin === true
  ) {
    if (!groupAdmin && !botAdmin) {
      return deny("Group Admin only", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
    }
  }

  // Whitelist-only command.
  if (
    commandConfig.whitelistOnly === true ||
    commandConfig.onlyWhitelist === true
  ) {
    if (!whitelisted && !botAdmin) {
      return deny("Whitelist only", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
    }
  }

  const requiredRole = roleNumber(
    commandConfig.role ??
    commandConfig.permission ??
    COMMAND_CONFIG.defaultRole
  );

  if (requiredRole < 0) {
    return deny("Invalid role", "কমান্ডের permission configuration সঠিক নয়।");
  }

  if (whitelist.enabled && !botAdmin && !whitelisted) {
    return deny("Whitelist only", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
  }

  if (requiredRole === 2 && !botAdmin) {
    return deny("Bot Admin only", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
  }

  if (requiredRole === 1 && !groupAdmin && !botAdmin) {
    return deny("Group Admin only", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
  }

  if (whitelist.enabled && whitelisted) {
    return allow("Whitelist access");
  }

  let mode = CONFIG.MESSAGE_MODE || "all";

  if (whitelist.enabled) {
    mode = "whiteListMode";
  }

  if (mode === "ownerOnly" && !botAdmin) {
    return deny("Owner only mode", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
  }

  if (mode === "adminOnly" && !botAdmin && !groupAdmin) {
    return deny("Admin only mode", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
  }

  if (mode === "whiteListMode" && !whitelisted && !botAdmin) {
    return deny("Whitelist mode", "🤭𝐎𝐍𝐋𝐘 𝐌𝐘 𝐁𝐎𝐎𝐒 🥵𝐒𝐈𝐘𝐀𝐌 💋সর 🤨তুই লেভেলে নাই 🤪🤒");
  }

  return allow("Permission granted");
}

export default checkPermission;
