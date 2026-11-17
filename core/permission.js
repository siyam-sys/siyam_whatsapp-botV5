
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

function roleNumber(value) {
  if (typeof value === "number") {
    return Math.max(0, Math.min(2, value));
  }

  const roles = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 2,
    USER: 0,
    GROUP_ADMIN: 1,
    ADMIN: 1,
    BOT_ADMIN: 2,
    OWNER: 2
  };

  return roles[String(value ?? "USER").toUpperCase()] ?? -1;
}

async function getWhitelist() {
  const file = CONFIG.DATABASE.WHITELIST_FILE;

  try {
    if (!(await fs.pathExists(file))) {
      return { enabled: false, ids: [...CONFIG.WHITELIST_IDS] };
    }

    const data = await fs.readJson(file);

    return {
      enabled: Boolean(data.enabled),
      ids: Array.isArray(data.ids)
        ? data.ids.map(normalizeWhatsAppId).filter(Boolean)
        : [...CONFIG.WHITELIST_IDS]
    };
  } catch {
    return { enabled: false, ids: [...CONFIG.WHITELIST_IDS] };
  }
}

export async function checkPermission(context, commandConfig = {}) {
  const {
    sock,
    jid,
    senderJid,
    senderUid,
    senderAltJid,
    isGroup
  } = context;

  const identities = [senderJid, senderUid, senderAltJid].filter(Boolean);

  if (isOwner(...identities)) {
    return { allowed: true, role: "BOT_ADMIN", roleLevel: 2, reason: "Owner" };
  }

  const botAdmin = isBotAdmin(...identities);
  let groupAdmin = false;

  if (isGroup && sock && jid) {
    try {
      const metadata = await sock.groupMetadata(jid);

      groupAdmin = (metadata.participants || []).some(participant => {
        const participantIds = [
          participant.id,
          participant.lid,
          participant.phoneNumber
        ].filter(Boolean);

        const sameUser = participantIds.some(id =>
          identities.some(sender =>
            normalizeWhatsAppId(id) === normalizeWhatsAppId(sender)
          )
        );

        return sameUser &&
          ["admin", "superadmin"].includes(participant.admin);
      });
    } catch {
      groupAdmin = false;
    }
  }

  let roleLevel = getConfiguredRole(...identities);
  if (groupAdmin && roleLevel < 1) roleLevel = 1;

  const role = roleLevel >= 2
    ? "BOT_ADMIN"
    : roleLevel === 1
      ? "GROUP_ADMIN"
      : "USER";

  const requiredRole = roleNumber(
    commandConfig.role ??
    commandConfig.permission ??
    COMMAND_CONFIG.defaultRole
  );

  if (requiredRole < 0) {
    return { allowed: false, role, roleLevel, reason: "Invalid role" };
  }

  const whitelist = await getWhitelist();

  const whitelisted =
    isWhitelisted(...identities) ||
    whitelist.ids.some(id =>
      identities.some(sender =>
        normalizeWhatsAppId(id) === normalizeWhatsAppId(sender)
      )
    );

  if (whitelist.enabled && !botAdmin && !whitelisted) {
    return { allowed: false, role, roleLevel, reason: "Whitelist only" };
  }

  if (requiredRole === 2 && !botAdmin) {
    return { allowed: false, role, roleLevel, reason: "Bot Admin only" };
  }

  if (whitelist.enabled && whitelisted && requiredRole <= 1) {
    return { allowed: true, role, roleLevel, reason: "Whitelist access" };
  }

  if (roleLevel < requiredRole) {
    return { allowed: false, role, roleLevel, reason: "Insufficient role" };
  }

  let mode = CONFIG.MESSAGE_MODE;

  if (whitelist.enabled) mode = "whiteListMode";

  if (mode === "ownerOnly" && !botAdmin) {
    return { allowed: false, role, roleLevel, reason: "Bot Admin only" };
  }

  if (mode === "adminOnly" && !botAdmin && !groupAdmin) {
    return { allowed: false, role, roleLevel, reason: "Admin only" };
  }

  if (mode === "whiteListMode" && !whitelisted && !botAdmin) {
    return { allowed: false, role, roleLevel, reason: "Whitelist only" };
  }

  return { allowed: true, role, roleLevel, reason: "Permission granted" };
    }
            
