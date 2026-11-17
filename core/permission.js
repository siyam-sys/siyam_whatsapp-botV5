
import fs from "fs-extra";

import {
  CONFIG,
  isOwner,
  isBotAdmin,
  isWhitelisted,
  normalizeWhatsAppId
} from "../config.js";

import { COMMAND_CONFIG } from "../configCommands.js";
import { getGroup } from "../database/groups.js";

function normalizeRequiredRole(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(3, Math.floor(value)));
  }

  const role = String(value ?? "USER").toUpperCase();

  const aliases = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    USER: 0,
    GROUP_ADMIN: 1,
    ADMIN: 1,
    BOT_ADMIN: 2,
    BOTADMIN: 2,
    OWNER: 3
  };

  return aliases[role] ?? -1;
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
        ? [
            ...new Set(
              data.ids.map(normalizeWhatsAppId).filter(Boolean)
            )
          ]
        : [...CONFIG.WHITELIST_IDS]
    };
  } catch (error) {
    console.error("[PERMISSION] Whitelist error:", error);

    return {
      enabled: false,
      ids: [...CONFIG.WHITELIST_IDS]
    };
  }
}

export async function checkPermission(context, commandConfig = {}) {
  const { sock, jid, senderJid, isGroup } = context;

  // MAIN OWNER: UNLIMITED PERMISSION
  if (isOwner(senderJid)) {
    return {
      allowed: true,
      role: "OWNER",
      roleLevel: 3,
      reason: "Main Owner"
    };
  }

  const botAdmin = isBotAdmin(senderJid);

  let groupAdmin = false;

  if (isGroup) {
    try {
      const metadata = await sock.groupMetadata(jid);

      groupAdmin = (metadata.participants || []).some(
        participant =>
          normalizeWhatsAppId(participant.id) ===
            normalizeWhatsAppId(senderJid) &&
          ["admin", "superadmin"].includes(participant.admin)
      );
    } catch (error) {
      groupAdmin = false;
    }
  }

  let role = 0;
  let roleName = "USER";

  if (botAdmin) {
    role = 2;
    roleName = "BOT_ADMIN";
  } else if (groupAdmin) {
    role = 1;
    roleName = "GROUP_ADMIN";
  }

  const requiredRole = normalizeRequiredRole(
    commandConfig.role ??
    commandConfig.permission ??
    COMMAND_CONFIG.defaultRole
  );

  if (requiredRole < 0) {
    return {
      allowed: false,
      role: roleName,
      roleLevel: role,
      reason: "Invalid role"
    };
  }

  if (role < requiredRole) {
    return {
      allowed: false,
      role: roleName,
      roleLevel: role,
      reason: "Insufficient role"
    };
  }

  const whitelist = await getWhitelist();

  const whitelisted =
    isWhitelisted(senderJid) ||
    whitelist.ids.some(id =>
      normalizeWhatsAppId(id) === normalizeWhatsAppId(senderJid)
    );

  let mode = CONFIG.MESSAGE_MODE;

  if (isGroup) {
    try {
      const group = await getGroup(jid);
      if (group?.mode) mode = group.mode;
    } catch {}
  }

  if (whitelist.enabled) {
    mode = "whiteListMode";
  }

  if (mode === "ownerOnly") {
    return {
      allowed: false,
      role: roleName,
      roleLevel: role,
      reason: "Owner only mode"
    };
  }

  if (
    mode === "adminOnly" &&
    !botAdmin &&
    !groupAdmin
  ) {
    return {
      allowed: false,
      role: roleName,
      roleLevel: role,
      reason: "Admin only mode"
    };
  }

  if (
    mode === "whiteListMode" &&
    !whitelisted &&
    !botAdmin
  ) {
    return {
      allowed: false,
      role: roleName,
      roleLevel: role,
      reason: "Whitelist only"
    };
  }

  return {
    allowed: true,
    role: roleName,
    roleLevel: role,
    reason: "Permission granted"
  };
}
